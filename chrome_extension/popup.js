// Popup: worker identity, direct EPUB/PDF fetch + upload, manual upload fallback,
// sent-state lockout, and local analytics. Download capture lives in background.js.

const SERVER_URL = "https://api.outtloud.com/docmetadata";

const els = {};
let activeTab = null;
let lastMetadata = null;
let lastFileUrl = null;
let workerId = null;

window.addEventListener("DOMContentLoaded", init);

async function init() {
  for (const id of [
    "siteStatus",
    "workerStatus",
    "workerCard",
    "workerInput",
    "saveWorkerBtn",
    "preview",
    "status",
    "sendBtn",
    "captureBtn",
    "popularToggle",
    "newReleaseToggle",
    "fileInput",
    "fileLabel",
    "sendManualBtn",
    "pTitle",
    "pAuthor",
    "pGenre",
    "pPubDate",
    "pIsbn",
    "pSummary",
    "pEpub",
    "aSuccess",
    "aFailed",
    "aDirect",
    "aCapture",
    "aManual",
    "aHistory",
    "resetAnalyticsBtn",
  ]) {
    els[id] = document.getElementById(id);
  }

  els.saveWorkerBtn.addEventListener("click", onSaveWorker);
  els.workerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSaveWorker();
  });
  els.workerStatus.addEventListener("click", showWorkerCard);
  els.resetAnalyticsBtn.addEventListener("click", onResetAnalytics);
  els.fileInput.addEventListener("change", onFileChosen);
  els.sendManualBtn.addEventListener("click", onSendManual);
  els.sendBtn.addEventListener("click", onExtractAndSend);
  els.captureBtn.addEventListener("click", onCapture);
  els.popularToggle.addEventListener("change", () =>
    onTagToggle("popular", els.popularToggle.checked),
  );
  els.newReleaseToggle.addEventListener("change", () =>
    onTagToggle("new-release", els.newReleaseToggle.checked),
  );

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "session" && changes.lastStatus?.newValue) {
      showStoredStatus(changes.lastStatus.newValue);
    }
    if (area === "session" && changes.lastSent?.newValue) {
      if (activeTab?.url && changes.lastSent.newValue.url === activeTab.url)
        applySentState();
    }
    if (area === "local" && changes.analytics) {
      renderAnalytics();
    }
    if (area === "local" && changes.titleTag) {
      syncTagToggles(changes.titleTag.newValue || "");
    }
  });

  await loadWorker();
  await loadTagToggles();
  await renderAnalytics();

  const { lastStatus } = await chrome.storage.session.get("lastStatus");
  if (lastStatus && Date.now() - lastStatus.at < 10 * 60 * 1000)
    showStoredStatus(lastStatus);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;

  if (!tab?.url || !/oceanofpdf\.com/i.test(tab.url)) {
    els.siteStatus.textContent =
      "Open an oceanofpdf.com book page to use this importer.";
    return;
  }

  els.siteStatus.textContent = "oceanofpdf.com page detected.";
  els.sendBtn.disabled = false;
  els.captureBtn.disabled = false;

  if (await checkAlreadySent()) applySentState();
  else await refreshPreview();
}

// ---------- worker identity ----------

async function loadWorker() {
  const { worker_id } = await chrome.storage.local.get("worker_id");
  workerId = worker_id || null;
  updateWorkerHeader();
  if (!workerId) showWorkerCard();
}

function updateWorkerHeader() {
  els.workerStatus.textContent = workerId
    ? `Worker ${workerId}`
    : "Worker ID not set — click to set";
}

function showWorkerCard() {
  els.workerCard.style.display = "block";
  els.workerInput.value = workerId || "";
  els.workerInput.focus();
}

async function onSaveWorker() {
  const value = els.workerInput.value.trim();
  if (!value) {
    setStatus("Enter your worker ID first.", "error");
    return;
  }
  workerId = value;
  await chrome.storage.local.set({ worker_id: value });
  els.workerCard.style.display = "none";
  updateWorkerHeader();
  setStatus(`Worker ID saved: ${value}`, "ok");
}

function requireWorker() {
  if (workerId) return true;
  showWorkerCard();
  setStatus("Set your worker ID before sending.", "error");
  return false;
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

function syncTagToggles(tag) {
  els.popularToggle.checked = tag === "popular";
  els.newReleaseToggle.checked = tag === "new-release";
}

async function loadTagToggles() {
  syncTagToggles(await getTitleTag());
}

async function onTagToggle(tag, checked) {
  const nextTag = checked ? tag : "";
  await chrome.storage.local.set({
    titleTag: nextTag,
    markPopular: nextTag === "popular",
  });
  syncTagToggles(nextTag);
}

async function metadataWithTag(base = {}) {
  const tag = await getTitleTag();
  const metadata = { ...base };
  if (tag) metadata.tag = tag;
  return metadata;
}

// ---------- sent-book registry (listing-page marks) ----------

function normalizeUrl(url) {
  return (url || "").split("#")[0].replace(/\/+$/, "").toLowerCase();
}

async function recordSentBook(url, title) {
  const key = normalizeUrl(url);
  if (!key) return;
  const { sentBooks } = await chrome.storage.local.get("sentBooks");
  const map = sentBooks || {};
  map[key] = { title: title || "", at: Date.now() };
  await chrome.storage.local.set({ sentBooks: map });
}

// ---------- analytics ----------

async function recordResult(status, via, title, error = "") {
  const { analytics } = await chrome.storage.local.get("analytics");
  const a = analytics || { success: 0, failed: 0, byType: {}, history: [] };
  if (status === "success") a.success = (a.success || 0) + 1;
  else a.failed = (a.failed || 0) + 1;
  a.byType = a.byType || {};
  a.byType[via] = (a.byType[via] || 0) + 1;
  a.history = a.history || [];
  const entry = { title: title || "Untitled", status, via, at: Date.now() };
  if (error) entry.error = error;
  a.history.unshift(entry);
  a.history = a.history.slice(0, 50);
  await chrome.storage.local.set({ analytics: a });
}

async function renderAnalytics() {
  const { analytics } = await chrome.storage.local.get("analytics");
  const a = analytics || { success: 0, failed: 0, byType: {}, history: [] };
  els.aSuccess.textContent = a.success || 0;
  els.aFailed.textContent = a.failed || 0;
  els.aDirect.textContent = a.byType?.direct || 0;
  els.aCapture.textContent = a.byType?.capture || 0;
  els.aManual.textContent = a.byType?.manual || 0;

  const items = (a.history || []).slice(0, 8);
  els.aHistory.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "a-empty";
    empty.textContent = "No operations yet.";
    els.aHistory.appendChild(empty);
    return;
  }
  for (const item of items) {
    const li = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = `h-dot ${item.status === "success" ? "ok" : "fail"}`;
    const title = document.createElement("span");
    title.className = "h-title";
    title.textContent = item.title || "Untitled";
    const meta = document.createElement("span");
    meta.className = "h-meta";
    meta.textContent = `${item.via} · ${timeAgo(item.at)}`;
    if (item.error) li.title = item.error;
    li.append(dot, title, meta);
    els.aHistory.appendChild(li);
  }
}

async function onResetAnalytics() {
  await chrome.storage.local.remove("analytics");
  await renderAnalytics();
}

function timeAgo(ts) {
  const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ---------- status ----------

function setStatus(message, kind = "info") {
  els.status.textContent = message;
  els.status.className = kind;
}

function showStoredStatus(stored) {
  const kind =
    stored.state === "done"
      ? "ok"
      : stored.state === "error"
        ? "error"
        : "info";
  setStatus(stored.message || "", kind);
}

function setText(id, value) {
  els[id].textContent = value && String(value).trim() ? value : "—";
}

// ---------- page extraction / preview ----------

async function extractFromPage() {
  const resp = await chrome.tabs.sendMessage(activeTab.id, {
    action: "extract",
  });
  if (!resp?.ok) throw new Error("Extraction failed");
  lastMetadata = resp.metadata || {};
  lastFileUrl = resp.fileUrl || null;
  return resp;
}

async function refreshPreview() {
  try {
    const { metadata, fileUrl } = await extractFromPage();
    els.preview.style.display = "block";
    setText("pTitle", metadata.fullName);
    setText("pAuthor", metadata.author);
    setText("pGenre", metadata.genre);
    setText("pPubDate", metadata.pubDate);
    setText(
      "pIsbn",
      [metadata.isbn, metadata.asin].filter(Boolean).join(" / "),
    );
    setText(
      "pSummary",
      metadata.summary
        ? `${metadata.summary.slice(0, 160)}${metadata.summary.length > 160 ? "…" : ""}`
        : "",
    );
    setText(
      "pEpub",
      fileUrl
        ? "found on page"
        : "not found — click the download input on the page",
    );
  } catch {
    setStatus("Could not read the page. Reload it and try again.", "error");
  }
}

// ---------- sent-state lockout ----------

async function checkAlreadySent() {
  const { lastSent } = await chrome.storage.session.get("lastSent");
  return !!(lastSent?.url && activeTab?.url && lastSent.url === activeTab.url);
}

function applySentState() {
  els.sendBtn.dataset.sent = "1";
  els.sendBtn.disabled = true;
  els.sendBtn.textContent = "Already sent for this page";
  els.captureBtn.disabled = true;
}

async function markSent() {
  await chrome.storage.session.set({
    lastSent: { url: activeTab?.url || "", at: Date.now() },
  });
  applySentState();
  clearFields();
}

function clearFields() {
  lastMetadata = null;
  lastFileUrl = null;
  els.preview.style.display = "none";
  for (const id of [
    "pTitle",
    "pAuthor",
    "pGenre",
    "pPubDate",
    "pIsbn",
    "pSummary",
    "pEpub",
  ])
    setText(id, "");
  els.fileInput.value = "";
  els.fileLabel.textContent = "Choose .epub / .pdf manually...";
  els.sendManualBtn.disabled = true;
}

function setBusy(busy) {
  const sent = els.sendBtn.dataset.sent === "1";
  els.sendBtn.disabled = busy || sent;
  els.captureBtn.disabled = busy || sent;
  els.sendManualBtn.disabled = busy || !els.fileInput.files.length;
}

// ---------- upload ----------

function buildFormData(metadata, blob, filename) {
  const form = new FormData();
  if (blob) {
    form.append("type", "file");
    form.append("file", blob, filename || "book.epub");
  } else {
    form.append("type", "texts");
    form.append("texts", metadata.summary || metadata.fullName || "metadata");
  }
  form.append("worker_id", workerId || "");
  form.append("title", metadata.fullName || "");
  form.append("author", metadata.author || "");
  form.append("description", metadata.summary || "");
  form.append("genre", metadata.genre || "");
  form.append("isbn", metadata.isbn || "");
  form.append("asin", metadata.asin || "");
  form.append("language", metadata.language || "");
  form.append("pub_date", metadata.pubDate || "");
  form.append("series", metadata.series || "");
  form.append("source_url", metadata.sourceUrl || "");
  if (metadata.tag) form.append("tag", metadata.tag);
  return form;
}

async function uploadBook(metadata, blob, filename) {
  const resp = await fetch(SERVER_URL, {
    method: "POST",
    body: buildFormData(metadata, blob, filename),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok)
    throw new Error(body.error || `Server responded ${resp.status}`);
  return body;
}

async function fetchBookBlob(url) {
  const resp = await fetch(url, { credentials: "include", redirect: "follow" });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const blob = await resp.blob();
  const sig = await blob.slice(0, 2).text();
  // EPUBs are zip archives ('PK'); PDFs start with '%P'. Anything else is likely
  // an interstitial/ad page rather than the book file.
  if (!sig.startsWith("PK") && !sig.startsWith("%P")) {
    throw new Error("link did not return a book file");
  }
  return blob;
}

function filenameFor(metadata, url) {
  try {
    const name = decodeURIComponent(
      new URL(url).pathname.split("/").pop() || "",
    );
    if (/\.(epub|pdf)$/i.test(name)) return name.replace(/[^\w.\- ]/g, "_");
  } catch {}
  const base =
    (metadata.fullName || "book").replace(/[^\w\s-]/g, "").trim() || "book";
  return `${base}.epub`;
}

async function armCapture(metadata) {
  await chrome.runtime.sendMessage({
    action: "armCapture",
    metadata: await metadataWithTag(metadata),
    tabId: activeTab?.id,
  });
}

// ---------- button handlers ----------

async function onExtractAndSend() {
  if (!activeTab) return;
  if (!requireWorker()) return;
  setBusy(true);
  try {
    if (!lastMetadata) await refreshPreview();
    const metadata = await metadataWithTag(lastMetadata || {});
    if (!metadata.fullName && !metadata.summary) {
      throw new Error("No book data found on this page.");
    }

    if (lastFileUrl) {
      setStatus("Fetching book file from page link...", "info");
      let blob;
      try {
        blob = await fetchBookBlob(lastFileUrl);
      } catch (e) {
        await armCapture(metadata);
        setStatus(
          `Direct fetch failed (${e.message}). Capture mode armed — click the book download input on the page.`,
          "error",
        );
        return;
      }

      setStatus("Uploading to server...", "info");
      try {
        const result = await uploadBook(
          metadata,
          blob,
          filenameFor(metadata, lastFileUrl),
        );
        const title = result.doc_data?.title || metadata.fullName || "book";
        await recordResult("success", "direct", title);
        await recordSentBook(activeTab?.url, title);
        setStatus(`Sent "${title}" to server.`, "ok");
        await markSent();
      } catch (e) {
        await recordResult(
          "failed",
          "direct",
          metadata.fullName || "book",
          e.message,
        );
        setStatus(`Upload failed: ${e.message}`, "error");
      }
      return;
    }

    await armCapture(metadata);
    setStatus(
      "No direct book link found. Capture mode armed — click the book download input on the page.",
      "info",
    );
  } catch (e) {
    setStatus(e.message || String(e), "error");
  } finally {
    setBusy(false);
  }
}

async function onCapture() {
  if (!activeTab) return;
  if (!requireWorker()) return;
  setBusy(true);
  try {
    if (!lastMetadata) await refreshPreview();
    await armCapture(lastMetadata || {});
    setStatus(
      "Capture mode armed for 5 minutes — click the book download input on the page. A sidebar there will track progress.",
      "info",
    );
  } catch (e) {
    setStatus(e.message || String(e), "error");
  } finally {
    setBusy(false);
  }
}

function onFileChosen() {
  const file = els.fileInput.files[0];
  els.fileLabel.textContent = file
    ? file.name
    : "Choose .epub / .pdf manually...";
  els.sendManualBtn.disabled = !file;
}

async function onSendManual() {
  const file = els.fileInput.files[0];
  if (!file || !activeTab) return;
  if (!requireWorker()) return;
  setBusy(true);
  try {
    if (!lastMetadata) await refreshPreview();
    setStatus("Uploading to server...", "info");
    const result = await uploadBook(
      await metadataWithTag(lastMetadata || {}),
      file,
      file.name,
    );
    const title = result.doc_data?.title || file.name;
    await recordResult("success", "manual", title);
    await recordSentBook(activeTab?.url, title);
    setStatus(`Sent "${title}" to server.`, "ok");
    await markSent();
  } catch (e) {
    await recordResult(
      "failed",
      "manual",
      lastMetadata?.fullName || file.name,
      e.message,
    );
    setStatus(`Upload failed: ${e.message}`, "error");
  } finally {
    setBusy(false);
  }
}
