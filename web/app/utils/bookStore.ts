import type { LibraryBook } from "~/types/library";
import type { BookTocEntry } from "~/types/toc";
import type { PaginateOptions } from "~/composables/useReaderPagination";
import { paginateTextDom } from "~/composables/useReaderPagination";
import { computePageContentOffsets } from "~/utils/tocNavigation";

const DB_NAME = "ikawe-reader";
const DB_VERSION = 3;

const META_KEY = "ikawe-library-meta-v2";

type BookContentRecord = {
  id: string;
  content: string;
};

type BookCoverRecord = {
  id: string;
  dataUrl: string;
};

type BookTocRecord = {
  id: string;
  entries: BookTocEntry[];
};

type BookPageRecord = {
  key: string;
  text: string;
};

type PageCacheMeta = {
  key: string;
  pageCount: number;
  contentOffsets?: number[];
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!import.meta.client) {
    return Promise.reject(new Error("IndexedDB is only available in the browser"));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("contents")) {
        db.createObjectStore("contents", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("covers")) {
        db.createObjectStore("covers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("toc")) {
        db.createObjectStore("toc", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pages")) {
        db.createObjectStore("pages", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("pageCaches")) {
        db.createObjectStore("pageCaches", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });

  return dbPromise;
}

function txStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = fn(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () =>
          reject(request.error ?? new Error(`IndexedDB ${storeName} request failed`));
      }),
  );
}

export function loadLibraryMeta(): LibraryBook[] | null {
  if (!import.meta.client) return null;

  const stored = localStorage.getItem(META_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as LibraryBook[];
  } catch {
    return null;
  }
}

export function saveLibraryMeta(books: LibraryBook[]) {
  if (!import.meta.client) return;
  localStorage.setItem(META_KEY, JSON.stringify(books));
}

export async function saveBookContent(id: string, content: string) {
  await txStore("contents", "readwrite", (store) =>
    store.put({ id, content } satisfies BookContentRecord),
  );
}

export async function saveBookCover(id: string, dataUrl: string) {
  await txStore("covers", "readwrite", (store) =>
    store.put({ id, dataUrl } satisfies BookCoverRecord),
  );
}

export async function getBookCover(id: string): Promise<string | null> {
  const record = await txStore<BookCoverRecord | undefined>("covers", "readonly", (store) =>
    store.get(id),
  );
  return record?.dataUrl ?? null;
}

export async function deleteBookCover(id: string) {
  await txStore("covers", "readwrite", (store) => store.delete(id));
}

export async function saveBookToc(id: string, entries: BookTocEntry[]) {
  await txStore("toc", "readwrite", (store) =>
    store.put({ id, entries } satisfies BookTocRecord),
  );
}

export async function getBookToc(id: string): Promise<BookTocEntry[] | null> {
  const record = await txStore<BookTocRecord | undefined>("toc", "readonly", (store) =>
    store.get(id),
  );
  return record?.entries ?? null;
}

export async function deleteBookToc(id: string) {
  await txStore("toc", "readwrite", (store) => store.delete(id));
}

export async function getBookContent(id: string): Promise<string | null> {
  const record = await txStore<BookContentRecord | undefined>("contents", "readonly", (store) =>
    store.get(id),
  );
  return record?.content ?? null;
}

export async function deleteBookContent(id: string) {
  await txStore("contents", "readwrite", (store) => store.delete(id));
  await deleteBookCover(id);
  await deleteBookToc(id);
  await deletePagesForBook(id);
}

export function buildPageSettingsKey(
  bookId: string,
  options: Pick<
    PaginateOptions,
    | "fontSize"
    | "lineHeight"
    | "marginScale"
    | "fontFamily"
    | "viewportWidth"
    | "viewportHeight"
  >,
  contentBox?: { width: number; height: number },
): string {
  const box = contentBox
    ? `${Math.round(contentBox.width)}x${Math.round(contentBox.height)}`
    : "auto";
  return [
    bookId,
    options.fontSize,
    options.lineHeight,
    options.marginScale,
    options.fontFamily,
    Math.round(options.viewportWidth),
    Math.round(options.viewportHeight),
    box,
  ].join(":");
}

export async function getCachedPageContentOffsets(
  cacheKey: string,
): Promise<number[] | null> {
  const record = await txStore<PageCacheMeta | undefined>("pageCaches", "readonly", (store) =>
    store.get(cacheKey),
  );
  return record?.contentOffsets ?? null;
}

export async function getCachedPageCount(cacheKey: string): Promise<number | null> {
  const record = await txStore<PageCacheMeta | undefined>("pageCaches", "readonly", (store) =>
    store.get(cacheKey),
  );
  return record?.pageCount ?? null;
}

export async function getCachedPageText(pageKey: string): Promise<string | null> {
  const record = await txStore<BookPageRecord | undefined>("pages", "readonly", (store) =>
    store.get(pageKey),
  );
  return record?.text ?? null;
}

export async function ensurePaginatedPages(
  cacheKey: string,
  options: PaginateOptions,
): Promise<number> {
  const existing = await getCachedPageCount(cacheKey);
  if (existing && existing > 0) {
    const offsets = await getCachedPageContentOffsets(cacheKey);
    if (offsets?.length) return existing;
  }

  const pages = paginateTextDom(options);
  const contentOffsets = computePageContentOffsets(options.content, pages);
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["pages", "pageCaches"], "readwrite");
    const pageStore = tx.objectStore("pages");
    const cacheStore = tx.objectStore("pageCaches");

    pages.forEach((text, index) => {
      pageStore.put({
        key: `${cacheKey}:${index}`,
        text,
      } satisfies BookPageRecord);
    });

    cacheStore.put({
      key: cacheKey,
      pageCount: pages.length,
      contentOffsets,
    } satisfies PageCacheMeta);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to cache paginated pages"));
  });

  return pages.length;
}

async function deletePagesForBook(bookId: string) {
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["pages", "pageCaches"], "readwrite");
    const pageStore = tx.objectStore("pages");
    const cacheStore = tx.objectStore("pageCaches");
    const prefix = `${bookId}:`;

    const pageCursor = pageStore.openCursor();
    pageCursor.onsuccess = () => {
      const cursor = pageCursor.result;
      if (!cursor) return;
      if (String(cursor.key).startsWith(prefix)) {
        cursor.delete();
      }
      cursor.continue();
    };

    const cacheCursor = cacheStore.openCursor();
    cacheCursor.onsuccess = () => {
      const cursor = cacheCursor.result;
      if (!cursor) return;
      if (String(cursor.key).startsWith(prefix)) {
        cursor.delete();
      }
      cursor.continue();
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to delete cached pages"));
  });
}

export async function migrateLegacyLibrary() {
  if (!import.meta.client) return;

  const legacy = localStorage.getItem("ikawe-library-v1");
  if (!legacy) return;

  try {
    const parsed = JSON.parse(legacy) as Array<LibraryBook & { content?: string }>;
    const meta: LibraryBook[] = [];

    for (const book of parsed) {
      const { content, ...rest } = book;
      meta.push(rest);
      if (content) {
        await saveBookContent(book.id, content);
      }
    }

    saveLibraryMeta(meta);
    localStorage.removeItem("ikawe-library-v1");
  } catch {
    localStorage.removeItem("ikawe-library-v1");
  }
}
