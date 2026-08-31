// Content script: extracts book metadata from oceanofpdf.com pages, detects clicks
// on the page's download input, and drives the in-page capture sidebar.

const LABEL_PATTERNS = {
  fullName: /^Full Book Name\s*[:#]\s*(.+)$/i,
  author: /^Author Name\s*[:#]\s*(.+)$/i,
  genre: /^Book Genre\s*[:#]\s*(.+)$/i,
  series: /^Series Detail\s*[:#]?\s*(.*)$/i,
  isbn: /^ISBN\s*[:#]\s*(.+)$/i,
  asin: /^ASIN\s*[:#]\s*(.+)$/i,
  language: /^Edition Language\s*[:#]\s*(.+)$/i,
  pubDate: /^Date of Publication\s*[:#]\s*(.+)$/i,
};

// Register this page so the background worker can attribute downloads to it.
chrome.runtime.sendMessage({ action: "pageReady" }).catch(() => {});

// ---------- metadata extraction ----------

function extractSummary() {
  const candidates = Array.from(document.querySelectorAll("p em"))
    .map((el) => (el.innerText || "").trim())
    .filter(Boolean);
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] || "";
}

function extractLabeledFields() {
  const meta = {};
  const lines = (document.body.innerText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    for (const [key, pattern] of Object.entries(LABEL_PATTERNS)) {
      if (meta[key]) continue;
      const match = line.match(pattern);
      if (match) meta[key] = match[1].trim();
    }
  }
  return meta;
}

function applyHeadingFallbacks(meta) {
  const heading = (document.querySelector("h1")?.innerText || "").trim();
  if (!heading) return meta;

  if (!meta.fullName) meta.fullName = heading;
  if (!meta.author) {
    const byMatch = heading.match(/^(.*?)\s+by\s+(.+)$/i);
    if (byMatch) {
      meta.author = byMatch[2].trim();
      if (meta.fullName === heading) meta.fullName = byMatch[1].trim();
    }
  }
  return meta;
}

function extractBookData() {
  const meta = applyHeadingFallbacks(extractLabeledFields());
  meta.summary = extractSummary();
  meta.sourceUrl = location.href;
  return meta;
}

// ---------- book file link discovery (epub or pdf) ----------

function absolutize(url) {
  try {
    return new URL(url, location.href).href;
  } catch {
    return null;
  }
}

function extractUrlFromString(raw) {
  if (!raw) return null;
  const absolute = raw.match(/https?:\/\/[^\s'"<>\\)]+/i);
  if (absolute) return absolutize(absolute[0]);
  const relative = raw.match(/(\/[^\s'"<>\\)]+)/);
  if (relative) return absolutize(relative[1]);
  return null;
}

function findBookFileUrl() {
  const anchors = Array.from(document.querySelectorAll("a[href]"));

  for (const anchor of anchors) {
    if (/\.(epub|pdf)(\?|#|$)/i.test(anchor.href)) return anchor.href;
  }

  const interactive = Array.from(
    document.querySelectorAll(
      "[onclick], [data-href], [data-url], [data-link], [data-download]",
    ),
  );

  for (const el of interactive) {
    const attrs = [
      el.getAttribute("onclick"),
      el.getAttribute("data-href"),
      el.getAttribute("data-url"),
      el.getAttribute("data-link"),
      el.getAttribute("data-download"),
    ];
    for (const raw of attrs) {
      if (raw && /\.(epub|pdf)/i.test(raw)) {
        const url = extractUrlFromString(raw);
        if (url) return url;
      }
    }
  }

  // No direct file URL — settle for anything that looks like a download endpoint.
  for (const anchor of anchors) {
    if (
      /download/i.test(anchor.href) &&
      !/\.(css|js|png|jpe?g|svg|gif|webp)(\?|#|$)/i.test(anchor.href)
    ) {
      return anchor.href;
    }
  }
  for (const el of interactive) {
    const onclick = el.getAttribute("onclick");
    if (onclick && /download|window\.open|location\.href/i.test(onclick)) {
      const url = extractUrlFromString(onclick);
      if (url) return url;
    }
  }
  return null;
}

// ---------- in-page sidebar ----------

const SIDEBAR_ID = "outtloud-importer-host";
let captureInProgress = false;
let captureWatchdog = null;

function ensureSidebar() {
  let host = document.getElementById(SIDEBAR_ID);
  if (host) return host;

  host = document.createElement("div");
  host.id = SIDEBAR_ID;
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .panel {
        position: fixed; top: 0; right: 0; width: 340px; height: 100vh;
        background: #ffffff; border-left: 1px solid #e5e5ea;
        box-shadow: -8px 0 24px rgba(0, 0, 0, 0.14);
        display: flex; flex-direction: column; z-index: 2147483647;
      }
      header {
        padding: 14px 16px; border-bottom: 1px solid #e5e5ea;
        display: flex; align-items: center; justify-content: space-between;
      }
      h1 { font-size: 14px; margin: 0; font-weight: 650; color: #1c1c1e; }
      #closeBtn { border: none; background: none; font-size: 20px; cursor: pointer; color: #6e6e73; padding: 0 4px; line-height: 1; }
      #closeBtn:hover { color: #1c1c1e; }
      .body { padding: 14px 16px; overflow-y: auto; flex: 1; }
      dl { margin: 0 0 16px; display: grid; grid-template-columns: 82px 1fr; row-gap: 5px; column-gap: 8px; font-size: 12px; }
      dt { color: #6e6e73; }
      dd { margin: 0; color: #1c1c1e; word-break: break-word; max-height: 60px; overflow: hidden; }
      .steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
      .steps li { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8e8e93; }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #d4d4d8; flex: none; }
      li.active { color: #1e40af; }
      li.active .dot { background: #2563eb; animation: pulse 0.9s infinite alternate; }
      li.done { color: #065f46; }
      li.done .dot { background: #10b981; }
      li.error { color: #991b1b; }
      li.error .dot { background: #ef4444; }
      .note { color: #8e8e93; font-size: 11px; margin-left: auto; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #result { display: none; margin-top: 14px; padding: 8px 10px; border-radius: 8px; font-size: 12px; line-height: 1.45; }
      #result.ok { display: block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
      #result.error { display: block; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
      footer { padding: 10px 16px; border-top: 1px solid #e5e5ea; font-size: 11px; color: #8e8e93; }
      @keyframes pulse { from { opacity: 1; } to { opacity: 0.3; } }
      .popular-row {
        display: flex; align-items: center; gap: 8px;
        margin: 0 0 8px; padding: 8px 10px;
        border: 1px solid #e5e5ea; border-radius: 8px;
        font-size: 12px; color: #1c1c1e; cursor: pointer;
      }
      .popular-row:last-of-type { margin-bottom: 14px; }
      .popular-row input { width: 14px; height: 14px; margin: 0; cursor: pointer; }
    </style>
    <div class="panel">
      <header>
        <h1>Outtloud Importer</h1>
        <button id="closeBtn" title="Close">&times;</button>
      </header>
      <div class="body">
        <dl id="fields">
          <dt>Title</dt><dd data-f="fullName">&mdash;</dd>
          <dt>Author</dt><dd data-f="author">&mdash;</dd>
          <dt>Genre</dt><dd data-f="genre">&mdash;</dd>
          <dt>Published</dt><dd data-f="pubDate">&mdash;</dd>
          <dt>ISBN</dt><dd data-f="isbn">&mdash;</dd>
          <dt>ASIN</dt><dd data-f="asin">&mdash;</dd>
          <dt>Language</dt><dd data-f="language">&mdash;</dd>
          <dt>Series</dt><dd data-f="series">&mdash;</dd>
          <dt>Summary</dt><dd data-f="summary">&mdash;</dd>
        </dl>
        <label class="popular-row">
          <input type="checkbox" id="popularToggle" />
          <span>Popular</span>
        </label>
        <label class="popular-row">
          <input type="checkbox" id="newReleaseToggle" />
          <span>New release</span>
        </label>
        <ul class="steps">
          <li data-step="capture"><span class="dot"></span><span>Capture download</span><span class="note"></span></li>
          <li data-step="fetch"><span class="dot"></span><span>Fetch book file</span><span class="note"></span></li>
          <li data-step="upload"><span class="dot"></span><span>Upload to server</span><span class="note"></span></li>
        </ul>
        <div id="result"></div>
      </div>
      <footer id="footer"></footer>
    </div>`;
  document.documentElement.appendChild(host);
  shadow.querySelector("#closeBtn").addEventListener("click", closeSidebar);
  shadow
    .querySelector("#popularToggle")
    .addEventListener("change", (event) => onSidebarTagToggle("popular", event.target.checked));
  shadow
    .querySelector("#newReleaseToggle")
    .addEventListener("change", (event) =>
      onSidebarTagToggle("new-release", event.target.checked),
    );
  return host;
}

async function getTitleTag() {
  const { titleTag, markPopular } = await chrome.storage.local.get([
    "titleTag",
    "markPopular",
  ]);
  if (titleTag) return titleTag;
  if (markPopular) return "popular";
  return "";
}

function syncSidebarTagToggles(tag) {
  const popularToggle = sidebarEl("#popularToggle");
  const newReleaseToggle = sidebarEl("#newReleaseToggle");
  if (popularToggle) popularToggle.checked = tag === "popular";
  if (newReleaseToggle) newReleaseToggle.checked = tag === "new-release";
}

async function onSidebarTagToggle(tag, checked) {
  const nextTag = checked ? tag : "";
  await chrome.storage.local.set({
    titleTag: nextTag,
    markPopular: nextTag === "popular",
  });
  syncSidebarTagToggles(nextTag);
}

function sidebarEl(selector) {
  return document
    .getElementById(SIDEBAR_ID)
    ?.shadowRoot?.querySelector(selector);
}

function fillSidebarFields(metadata) {
  const fields = sidebarEl("#fields");
  if (!fields) return;
  for (const dd of fields.querySelectorAll("dd")) {
    const value = metadata[dd.dataset.f];
    dd.textContent = value && String(value).trim() ? value : "—";
  }
}

function setStep(step, state, note = "") {
  const li = sidebarEl(`li[data-step="${step}"]`);
  if (!li) return;
  li.className = state;
  li.querySelector(".note").textContent = note;
}

function resetSteps() {
  const steps = sidebarEl(".steps");
  if (!steps) return;
  for (const li of steps.querySelectorAll("li")) {
    li.className = "";
    li.querySelector(".note").textContent = "";
  }
  const result = sidebarEl("#result");
  if (result) {
    result.className = "";
    result.textContent = "";
  }
}

function showResult(message, ok) {
  const result = sidebarEl("#result");
  if (!result) return;
  result.textContent = message;
  result.className = ok ? "ok" : "error";
}

async function metadataWithTag(base) {
  const tag = await getTitleTag();
  const metadata = { ...base };
  if (tag) metadata.tag = tag;
  return metadata;
}

async function openSidebar(metadata) {
  ensureSidebar();
  fillSidebarFields(metadata);
  resetSteps();
  const { worker_id } = await chrome.storage.local.get("worker_id");
  syncSidebarTagToggles(await getTitleTag());
  const footer = sidebarEl("#footer");
  if (footer) {
    footer.textContent = worker_id
      ? `Worker ${worker_id}`
      : "Worker ID not set — open the extension popup to set it.";
  }
}

function closeSidebar() {
  clearTimeout(captureWatchdog);
  if (captureInProgress) {
    chrome.runtime.sendMessage({ action: "disarmCapture" }).catch(() => {});
  }
  captureInProgress = false;
  document.getElementById(SIDEBAR_ID)?.remove();
}

// ---------- download click detection ----------

// Bare "download" is not a strong enough signal: book-page links on listing
// pages end with "-download/" and would false-trigger the capture flow.
const DOWNLOAD_CLICK_RE =
  /\.(epub|pdf)(\?|#|$)|epub-button|pdf-button|fetching_resource/i;

document.addEventListener(
  "click",
  (event) => {
    const el = event.target?.closest?.(
      'input, a, button, [onclick], [role="button"], img',
    );
    const inDownloadContainer = !!event.target?.closest?.(
      '[class*="download" i], [id*="download" i]',
    );
    if (!el && !inDownloadContainer) return;

    const label = el
      ? [
          el.value,
          el.innerText,
          el.alt,
          el.id,
          String(el.className || ""),
          el.getAttribute("onclick"),
          el.getAttribute("href"),
          el.getAttribute("src"),
          el.getAttribute("formaction"),
          el.getAttribute("data-href"),
          el.getAttribute("data-url"),
        ]
          .filter(Boolean)
          .join(" ")
      : "";

    if (!DOWNLOAD_CLICK_RE.test(label) && !inDownloadContainer) return;
    handleDownloadClick();
  },
  true,
);

// ---------- book form arming (primary path) ----------

let lastSubmitAt = 0;

function extractBookFormFields(form) {
  const fields = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  const filename = fields.filename || "";
  if (!filename || !/\.(epub|pdf)$/i.test(filename)) return null;
  return fields;
}

// The native submit proceeds untouched — it starts the download, which the
// background worker intercepts. Here we only arm the capture and open the
// progress sidebar.
document.addEventListener(
  "submit",
  (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const fields = extractBookFormFields(form);
    if (!fields) return;
    handleBookFormSubmit(fields);
  },
  true,
);

async function handleBookFormSubmit(fields) {
  const now = Date.now();
  if (now - lastSubmitAt < 3000) return;
  lastSubmitAt = now;
  captureInProgress = true;

  const metadata = await metadataWithTag(extractBookData());
  await openSidebar(metadata);
  setStep("capture", "active", "waiting for download");

  try {
    await chrome.runtime.sendMessage({
      action: "armCapture",
      metadata,
      filename: fields.filename,
    });
  } catch {
    setStep("capture", "error");
    showResult(
      "Could not reach the extension background worker. Reload the page and try again.",
      false,
    );
    captureInProgress = false;
    return;
  }

  clearTimeout(captureWatchdog);
  captureWatchdog = setTimeout(() => {
    if (!captureInProgress) return;
    captureInProgress = false;
    setStep("capture", "error", "timed out");
    showResult("No download started. Click the download button again.", false);
    chrome.runtime.sendMessage({ action: "disarmCapture" }).catch(() => {});
  }, 45000);
}

async function handleDownloadClick() {
  if (captureInProgress) return;
  captureInProgress = true;

  const metadata = await metadataWithTag(extractBookData());
  await openSidebar(metadata);
  setStep("capture", "active", "waiting for download");

  try {
    await chrome.runtime.sendMessage({ action: "armCapture", metadata });
  } catch {
    setStep("capture", "error");
    showResult(
      "Could not reach the extension background worker. Reload the page and try again.",
      false,
    );
    captureInProgress = false;
    return;
  }

  clearTimeout(captureWatchdog);
  captureWatchdog = setTimeout(() => {
    if (!captureInProgress) return;
    captureInProgress = false;
    setStep("capture", "error", "timed out");
    showResult("No download started. Click the download input again.", false);
    chrome.runtime.sendMessage({ action: "disarmCapture" }).catch(() => {});
  }, 45000);
}

// ---------- progress updates from the background worker ----------

function handleCaptureStatus(msg) {
  switch (msg.state) {
    case "captured":
      clearTimeout(captureWatchdog);
      setStep("capture", "done");
      setStep("fetch", "active", msg.note || "");
      break;
    case "uploading":
      setStep("fetch", "done", msg.note || "");
      setStep("upload", "active");
      break;
    case "done":
      setStep("fetch", "done");
      setStep("upload", "done");
      showResult(msg.message || "Sent to server.", true);
      captureInProgress = false;
      setTimeout(closeSidebar, 8000);
      break;
    case "error": {
      for (const step of ["upload", "fetch", "capture"]) {
        const li = sidebarEl(`li[data-step="${step}"]`);
        if (li?.className === "active") {
          setStep(step, "error");
          break;
        }
      }
      showResult(msg.message || "Operation failed.", false);
      captureInProgress = false;
      break;
    }
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "extract") {
    sendResponse({
      ok: true,
      metadata: extractBookData(),
      fileUrl: findBookFileUrl(),
    });
  } else if (msg.action === "showSidebar") {
    // Opened by the background worker when it intercepts a download on its own.
    if (!document.getElementById(SIDEBAR_ID)) {
      captureInProgress = true;
      clearTimeout(captureWatchdog);
      openSidebar(msg.metadata || {}).then(() => {
        setStep("capture", "done", msg.note || "");
        setStep("fetch", "active");
      });
    }
  } else if (msg.action === "captureStatus") {
    handleCaptureStatus(msg);
  }
  return true;
});

// ---------- listing pages: mark already-downloaded books ----------

const LISTING_STYLES = `
.outtloud-downloaded {
  outline: 3px solid #10b981 !important;
  outline-offset: 2px;
  border-radius: 6px;
  position: relative !important;
}
.outtloud-downloaded::after {
  content: "Downloaded";
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 9999;
  background: #10b981;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}
`;

const checkedTitles = new Set();
const downloadedTitles = new Set();
const sentUrls = new Set();
let listingObserverTimer = null;

function normalizeUrl(url) {
  return (url || "").split("#")[0].replace(/\/+$/, "").toLowerCase();
}

function findBookCards() {
  const cards = [];
  // Genre/category listing pages.
  for (const el of document.querySelectorAll("article.post")) {
    const link = el.querySelector("h2.entry-title a, a.entry-title-link");
    const title = link?.textContent.trim();
    if (link?.href && title) cards.push({ el, title, href: link.href });
  }
  // New-releases grid (and other widget-event sections).
  for (const el of document.querySelectorAll("div.widget-event")) {
    const link =
      el.querySelector(".widget-event__info .title a") ||
      el.querySelector("a.title-image");
    const title = (
      link?.textContent ||
      link?.getAttribute("title") ||
      ""
    ).trim();
    if (link?.href && title) cards.push({ el, title, href: link.href });
  }
  return cards;
}

async function loadSentUrlCache() {
  try {
    const { sentBooks } = await chrome.storage.local.get("sentBooks");
    for (const key of Object.keys(sentBooks || {})) sentUrls.add(key);
  } catch {}
}

async function refreshDownloadedMarks() {
  const cards = findBookCards();
  if (!cards.length) return;

  const unknownTitles = [
    ...new Set(
      cards
        .map((c) => c.title.toLowerCase())
        .filter((t) => t && !checkedTitles.has(t)),
    ),
  ];
  if (unknownTitles.length) {
    for (const t of unknownTitles) checkedTitles.add(t);
    try {
      const resp = await chrome.runtime.sendMessage({
        action: "checkTitles",
        titles: unknownTitles,
      });
      if (resp?.ok) {
        for (const t of resp.existing || [])
          downloadedTitles.add(t.toLowerCase());
      }
    } catch {}
  }

  for (const card of cards) {
    if (
      downloadedTitles.has(card.title.toLowerCase()) ||
      sentUrls.has(normalizeUrl(card.href))
    ) {
      card.el.classList.add("outtloud-downloaded");
    }
  }
}

function initListingMarker() {
  if (!findBookCards().length) return;
  const style = document.createElement("style");
  style.textContent = LISTING_STYLES;
  document.head.appendChild(style);

  loadSentUrlCache().then(refreshDownloadedMarks);

  // Re-check when new cards appear (infinite scroll / lazy rendering).
  const observer = new MutationObserver(() => {
    clearTimeout(listingObserverTimer);
    listingObserverTimer = setTimeout(refreshDownloadedMarks, 600);
  });
  observer.observe(document.querySelector("main") || document.body, {
    childList: true,
    subtree: true,
  });
}

initListingMarker();
