// Service worker: intercepts book downloads from oceanofpdf tabs (whether or not
// capture was armed beforehand), closes the tab the site opened for the download,
// fetches the file itself, and uploads everything to the local server. Runs
// outside the popup lifecycle so it survives the popup closing.

const SERVER_BASE = "https://api.outtloud.com";
const SERVER_URL = `${SERVER_BASE}/docmetadata`;
const CAPTURE_TTL_MS = 5 * 60 * 1000;

function buildFormData(metadata, blob, filename, workerId) {
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
  const { worker_id, titleTag, markPopular } = await chrome.storage.local.get([
    "worker_id",
    "titleTag",
    "markPopular",
  ]);
  const payload = { ...metadata };
  if (!payload.tag) {
    if (titleTag) payload.tag = titleTag;
    else if (markPopular) payload.tag = "popular";
  }
  const resp = await fetch(SERVER_URL, {
    method: "POST",
    body: buildFormData(payload, blob, filename, worker_id),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok)
    throw new Error(body.error || `Server responded ${resp.status}`);
  return body;
}

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

async function setStatus(status) {
  await chrome.storage.session.set({
    lastStatus: { ...status, at: Date.now() },
  });
}

function filenameFor(metadata, downloadFilename, url, armedFilename) {
  const fromDownload = (downloadFilename || "").split(/[\\/]/).pop();
  if (/\.(epub|pdf)$/i.test(fromDownload)) return fromDownload;
  if (/\.(epub|pdf)$/i.test(armedFilename || "")) return armedFilename;
  try {
    const fromUrl = decodeURIComponent(
      new URL(url).pathname.split("/").pop() || "",
    );
    if (/\.(epub|pdf)$/i.test(fromUrl))
      return fromUrl.replace(/[^\w.\- ]/g, "_");
  } catch {}
  const base =
    (metadata.fullName || "book").replace(/[^\w\s-]/g, "").trim() || "book";
  return `${base}.epub`;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function notifyTab(tabId, msg) {
  if (tabId == null) return;
  chrome.tabs.sendMessage(tabId, msg).catch(() => {});
}

async function failCapture(tabId, title, message) {
  await recordResult("failed", "capture", title, message);
  await setStatus({ state: "error", message });
  notifyTab(tabId, { action: "captureStatus", state: "error", message });
}

// The server returns e.g. "Failed to process EPUB file: cannot open broken
// document" — surface the reason and point at the other format when known.
function serverFailureMessage(e, filename) {
  const raw = e?.message || String(e);
  // Duplicate submissions are shown as-is — the other format is not a fix.
  if (/already exists/i.test(raw)) return raw;
  // Network / upload failures are not format issues.
  if (/failed to fetch|network|timeout|server responded/i.test(raw))
    return `Upload failed: ${raw}`;
  const reason = raw
    .replace(/^failed to process (epub|pdf) file:\s*/i, "")
    .trim();
  const format = /\.epub$/i.test(filename)
    ? "EPUB"
    : /\.pdf$/i.test(filename)
      ? "PDF"
      : "";
  if (!format) return `Server failed: ${reason}`;
  const alt =
    format === "EPUB"
      ? "Try the PDF version instead."
      : "Try the EPUB version instead.";
  return `${format} failed: ${reason} ${alt}`;
}

// The content script registers every oceanofpdf page it loads on, so downloads
// can be attributed to the right book tab even when capture was never armed.
async function findSourceTab() {
  const { bookTab } = await chrome.storage.session.get("bookTab");
  if (bookTab?.id != null) {
    try {
      await chrome.tabs.get(bookTab.id);
      return bookTab.id;
    } catch {}
  }
  const tabs = await chrome.tabs.query({ url: "*://*.oceanofpdf.com/*" });
  // Prefer a non-active tab — the download click usually activates the new tab.
  const bookPage = tabs.find((t) => !t.active) || tabs[0];
  return bookPage?.id ?? null;
}

function normalizeUrl(url) {
  return (url || "").split("#")[0].replace(/\/+$/, "").toLowerCase();
}

// Persistent registry of books sent from this browser, keyed by normalized
// book-page URL. Used to mark already-downloaded books on listing pages.
async function recordSentBook(url, title) {
  const key = normalizeUrl(url);
  if (!key) return;
  const { sentBooks } = await chrome.storage.local.get("sentBooks");
  const map = sentBooks || {};
  map[key] = { title: title || "", at: Date.now() };
  const keys = Object.keys(map);
  if (keys.length > 2000) {
    keys.sort((a, b) => (map[a].at || 0) - (map[b].at || 0));
    for (const k of keys.slice(0, keys.length - 2000)) delete map[k];
  }
  await chrome.storage.local.set({ sentBooks: map });
}

// Authoritative cross-worker check: asks the server which titles already
// exist in the database, and merges titles recorded locally.
async function handleCheckTitles(titles) {
  const existing = new Set();
  try {
    const resp = await fetch(`${SERVER_BASE}/titles/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titles: titles.slice(0, 200) }),
    });
    const body = await resp.json().catch(() => ({}));
    if (resp.ok) {
      for (const t of body.existing || []) existing.add(t.toLowerCase());
    }
  } catch {}
  const { sentBooks } = await chrome.storage.local.get("sentBooks");
  for (const b of Object.values(sentBooks || {})) {
    if (b.title) existing.add(b.title.toLowerCase());
  }
  return { ok: true, existing: [...existing] };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "checkTitles") {
    handleCheckTitles(msg.titles || []).then(sendResponse);
    return true;
  }
  if (msg.action === "pageReady") {
    if (sender.tab?.id != null) {
      chrome.storage.session
        .set({
          bookTab: {
            id: sender.tab.id,
            url: sender.tab.url || "",
            at: Date.now(),
          },
        })
        .then(() => sendResponse({ ok: true }));
      return true;
    }
  }
  if (msg.action === "armCapture") {
    chrome.storage.session
      .set({
        pendingCapture: {
          metadata: msg.metadata,
          filename: msg.filename || "",
          tabId: sender.tab?.id ?? msg.tabId ?? null,
          armedAt: Date.now(),
        },
      })
      .then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.action === "disarmCapture") {
    chrome.storage.session
      .remove("pendingCapture")
      .then(() => sendResponse({ ok: true }));
    return true;
  }
});

// Remember tabs opened from an oceanofpdf page so the download's tab can be closed.
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.openerTabId == null) return;
  chrome.tabs
    .get(tab.openerTabId)
    .then((opener) => {
      if (!opener?.url || !/oceanofpdf\.com/i.test(opener.url)) return;
      chrome.storage.session.get("childTabs").then(({ childTabs }) => {
        const map = childTabs || {};
        map[tab.openerTabId] = { tabId: tab.id, at: Date.now() };
        chrome.storage.session.set({ childTabs: map });
      });
    })
    .catch(() => {});
});

async function getDownloadTabId(sourceTabId, itemTabId) {
  if (itemTabId != null && itemTabId >= 0) return itemTabId;
  const { childTabs } = await chrome.storage.session.get("childTabs");
  return childTabs?.[sourceTabId]?.tabId ?? null;
}

async function closeDownloadTab(sourceTabId, downloadTabId) {
  const { childTabs } = await chrome.storage.session.get("childTabs");
  if (childTabs?.[sourceTabId]) {
    delete childTabs[sourceTabId];
    await chrome.storage.session.set({ childTabs });
  }
  if (downloadTabId == null) return;
  try {
    await chrome.tabs.remove(downloadTabId);
  } catch {}
}

function base64ToBlob(b64, type) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: type || "application/octet-stream" });
}

function rejectHtmlContentType(contentType) {
  if (/text\/html/i.test(contentType || "")) {
    throw new Error("received HTML instead of a book file");
  }
}

async function validateBookBlob(blob, filename) {
  if (blob.size < 2048) {
    throw new Error("file too small — likely blocked or incomplete");
  }
  const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  const ext = (filename.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") {
    const sig = String.fromCharCode(...head);
    if (!sig.startsWith("%PDF")) {
      throw new Error("not a valid PDF (site may have returned an error page)");
    }
  } else if (ext === "epub") {
    if (head[0] !== 0x50 || head[1] !== 0x4b) {
      throw new Error(
        "not a valid EPUB (site may have returned an error page)",
      );
    }
  }
  return blob;
}

// Runs inside the download tab so fetch carries the page cookies/session.
async function fetchViaDownloadTab(tabId, fileUrl) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: async (url) => {
      const resp = await fetch(url, {
        credentials: "include",
        redirect: "follow",
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const contentType = resp.headers.get("content-type") || "";
      if (/text\/html/i.test(contentType)) {
        throw new Error("received HTML instead of a book file");
      }
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      return {
        b64: btoa(binary),
        type: resp.headers.get("content-type") || "application/octet-stream",
      };
    },
    args: [fileUrl],
  });
  if (!result?.b64) throw new Error("empty response from download tab");
  return base64ToBlob(result.b64, result.type);
}

async function fetchViaBackground(fileUrl, referer) {
  const headers = {};
  if (referer) headers.Referer = referer;
  const resp = await fetch(fileUrl, {
    credentials: "include",
    redirect: "follow",
    headers,
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  rejectHtmlContentType(resp.headers.get("content-type"));
  return resp.blob();
}

async function fetchBookBlob(fileUrl, downloadTabId, referer, filename) {
  const strategies = [];

  // Direct background fetch keeps binary data intact — prefer over base64 tab transfer.
  for (const ref of [referer, "https://oceanofpdf.com/"]) {
    if (!ref) continue;
    strategies.push(() => fetchViaBackground(fileUrl, ref));
  }

  if (downloadTabId != null) {
    strategies.push(() => fetchViaDownloadTab(downloadTabId, fileUrl));
    strategies.push(async () => {
      const tab = await chrome.tabs.get(downloadTabId);
      if (
        tab.url &&
        tab.url !== fileUrl &&
        !tab.url.startsWith("about:") &&
        !tab.url.startsWith("chrome:")
      ) {
        return fetchViaDownloadTab(downloadTabId, tab.url);
      }
      throw new Error("no alternate download tab URL");
    });
  }

  let lastError = null;
  for (const strategy of strategies) {
    try {
      const blob = await strategy();
      return await validateBookBlob(blob, filename);
    } catch (e) {
      lastError = e;
      console.warn("fetch strategy failed:", e?.message || e);
    }
  }

  throw lastError || new Error("Failed to fetch");
}

chrome.downloads.onCreated.addListener(async (item) => {
  const { pendingCapture } = await chrome.storage.session.get("pendingCapture");
  const armed =
    !!pendingCapture && Date.now() - pendingCapture.armedAt <= CAPTURE_TTL_MS;

  const url = item.finalUrl || item.url || "";
  const looksLikeBook =
    /oceanofpdf/i.test(url) ||
    /\.(epub|pdf)(\?|$)/i.test(item.filename || "") ||
    /(epub|pdf)/i.test(item.mime || "");
  // When armed we also accept generic binary downloads; unarmed requires a
  // stronger signal so unrelated downloads are never hijacked.
  if (!(looksLikeBook || (armed && /octet-stream/i.test(item.mime || ""))))
    return;

  if (pendingCapture) await chrome.storage.session.remove("pendingCapture");

  const tabId = pendingCapture?.tabId ?? (await findSourceTab());
  if (tabId == null) return; // no book page to attribute this to — let it download normally

  const downloadTabId = await getDownloadTabId(tabId, item.tabId);

  // Stop the disk download but keep the download tab open until we have the file.
  try {
    await chrome.downloads.cancel(item.id);
  } catch {}
  try {
    await chrome.downloads.erase({ id: item.id });
  } catch {}

  let metadata = pendingCapture?.metadata || null;
  if (!metadata) {
    try {
      const resp = await chrome.tabs.sendMessage(tabId, { action: "extract" });
      if (resp?.ok) metadata = resp.metadata;
    } catch {}
  }
  metadata = metadata || {};
  const title = metadata.fullName || "book";
  const referer = metadata.sourceUrl || item.referrer || "";
  const filename = filenameFor(
    metadata,
    item.filename,
    url,
    pendingCapture?.filename,
  );

  notifyTab(tabId, { action: "showSidebar", metadata, note: filename });
  notifyTab(tabId, {
    action: "captureStatus",
    state: "captured",
    note: filename,
  });
  await setStatus({
    state: "working",
    message: "Download captured, fetching file...",
  });

  let blob;
  try {
    blob = await fetchBookBlob(url, downloadTabId, referer, filename);
  } catch (e) {
    await failCapture(
      tabId,
      title,
      `Could not fetch the book file from oceanofpdf: ${e?.message || e}`,
    );
    return;
  } finally {
    await closeDownloadTab(tabId, downloadTabId);
  }

  notifyTab(tabId, {
    action: "captureStatus",
    state: "uploading",
    note: `${filename} (${formatBytes(blob.size)})`,
  });

  try {
    const result = await uploadBook(metadata, blob, filename);
    const sentTitle = result.doc_data?.title || title;
    await recordResult("success", "capture", sentTitle);
    await recordSentBook(metadata.sourceUrl, sentTitle);
    await chrome.storage.session.set({
      lastSent: { url: metadata.sourceUrl || "", at: Date.now() },
    });
    await setStatus({
      state: "done",
      message: `Sent "${sentTitle}" to server.`,
      result,
    });
    notifyTab(tabId, {
      action: "captureStatus",
      state: "done",
      message: `Sent "${sentTitle}" to server.`,
    });
  } catch (e) {
    await failCapture(tabId, title, serverFailureMessage(e, filename));
  }
});
