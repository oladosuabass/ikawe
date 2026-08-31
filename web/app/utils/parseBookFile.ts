import type { LibraryBookWithContent } from "~/types/library";
import type { BookTocEntry } from "~/types/toc";
import { extractBookFromFile } from "~/utils/extractBookFromFile";
import { buildTocForContent } from "~/utils/tocNavigation";

const COVER_COLORS = [
  "#8B9A7E",
  "#5C6B73",
  "#A67C5B",
  "#7D6E8C",
  "#6B7F8C",
  "#8C7B6B",
];

const LOCAL_TEXT_EXTENSIONS = new Set(["txt", "md"]);
const REMOTE_EXTENSIONS = new Set([
  "pdf",
  "epub",
  "docx",
  "doc",
  "html",
  "htm",
  "rtf",
  "odt",
  "xps",
  "oxps",
  "cbz",
  "fb2",
  "mobi",
]);

function pickCoverColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return COVER_COLORS[hash % COVER_COLORS.length];
}

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeFormat(extension: string): LibraryBookWithContent["format"] {
  if (extension === "epub") return "epub";
  if (extension === "pdf") return "pdf";
  if (extension === "demo") return "demo";
  return "txt";
}

function buildStoredToc(content: string, serverToc?: BookTocEntry[] | null) {
  const entries = buildTocForContent(content, serverToc);
  return {
    entries,
    hasToc: entries.length > 0,
  };
}

export type ParsedLibraryBook = LibraryBookWithContent & {
  coverImage?: string | null;
};

export async function parseBookFile(file: File): Promise<ParsedLibraryBook> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const id = crypto.randomUUID();

  if (LOCAL_TEXT_EXTENSIONS.has(extension)) {
    const content = await file.text();
    const { entries, hasToc } = buildStoredToc(content);
    return {
      id,
      title: titleFromFilename(file.name),
      author: "Unknown author",
      format: "txt",
      content,
      toc: entries,
      addedAt: new Date().toISOString(),
      coverColor: pickCoverColor(file.name),
      hasToc,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    };
  }

  if (REMOTE_EXTENSIONS.has(extension)) {
    const extracted = await extractBookFromFile(file);
    const { entries, hasToc } = buildStoredToc(
      extracted.content,
      extracted.toc,
    );
    const hasCover = !!extracted.cover_image;
    return {
      id,
      title: extracted.title || titleFromFilename(file.name),
      author: extracted.author || "Unknown author",
      format: normalizeFormat(extracted.format || extension),
      content: extracted.content,
      toc: entries,
      addedAt: new Date().toISOString(),
      coverColor: pickCoverColor(file.name),
      hasCover,
      hasToc,
      wordCount:
        extracted.word_count ||
        extracted.content.split(/\s+/).filter(Boolean).length,
      coverImage: extracted.cover_image ?? null,
    };
  }

  throw new Error(
    "Unsupported format. Upload PDF, EPUB, DOCX, TXT, MD, HTML, RTF, ODT, MOBI, FB2, CBZ, or XPS.",
  );
}
