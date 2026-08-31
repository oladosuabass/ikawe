import type { BookTocEntry, ResolvedTocEntry } from "~/types/toc";
import { isReaderImageBlock } from "~/utils/readerContent";

function titleCandidates(title: string): string[] {
  return [
    title.trim(),
    title.replace(/^\d+[\.)]\s*/, "").trim(),
    title.replace(/^chapter\s+\d+[:\-.]?\s*/i, "").trim(),
  ].filter((candidate) => candidate.length >= 3);
}

function findTitleOffset(
  content: string,
  title: string,
  searchFrom = 0,
): number {
  const lowerContent = content.toLowerCase();

  for (const candidate of titleCandidates(title)) {
    const idx = lowerContent.indexOf(candidate.toLowerCase(), searchFrom);
    if (idx >= 0) return idx;
  }

  return -1;
}

export function extractMarkdownToc(content: string): BookTocEntry[] {
  const entries: BookTocEntry[] = [];
  const pattern = /^(#{1,6})\s+(.+)$/gm;

  for (const match of content.matchAll(pattern)) {
    const title = match[2]?.trim();
    if (!title) continue;

    entries.push({
      level: match[1]?.length ?? 1,
      title,
      page: null,
      offset: match.index ?? 0,
    });
  }

  return entries;
}

export function buildTocFromPlainText(content: string): BookTocEntry[] {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length < 3) return [];

  return paragraphs.slice(0, 20).map((paragraph) => {
    const offset = content.indexOf(paragraph);
    const title =
      paragraph.length > 72 ? `${paragraph.slice(0, 72).trim()}…` : paragraph;

    return {
      level: 1,
      title,
      page: null,
      offset: offset >= 0 ? offset : 0,
    };
  });
}

export function buildTocForContent(
  content: string,
  serverToc?: BookTocEntry[] | null,
): BookTocEntry[] {
  if (serverToc?.length) return serverToc;

  const markdownToc = extractMarkdownToc(content);
  if (markdownToc.length) return markdownToc;

  return buildTocFromPlainText(content);
}

export function resolveTocAnchors(
  content: string,
  entries: BookTocEntry[],
): ResolvedTocEntry[] {
  if (!entries.length || !content) return [];

  let searchFrom = 0;

  return entries.map((entry) => {
    if (entry.offset != null && entry.offset >= 0) {
      const offset = Math.min(entry.offset, Math.max(content.length - 1, 0));
      searchFrom = Math.max(searchFrom, offset + 1);
      return { ...entry, offset };
    }

    const titleOffset = findTitleOffset(content, entry.title, searchFrom);
    if (titleOffset >= 0) {
      searchFrom = titleOffset + 1;
      return { ...entry, offset: titleOffset };
    }

    const fallback = findTitleOffset(content, entry.title, 0);
    const offset = fallback >= 0 ? fallback : searchFrom;
    if (fallback >= 0) {
      searchFrom = fallback + 1;
    }
    return { ...entry, offset };
  });
}

export function computePageContentOffsets(
  content: string,
  pages: string[],
): number[] {
  const offsets: number[] = [];
  let searchFrom = 0;

  for (const page of pages) {
    const trimmed = page.trim();
    if (!trimmed) {
      offsets.push(searchFrom);
      continue;
    }

    if (isReaderImageBlock(trimmed)) {
      const idx = content.indexOf(trimmed, searchFrom);
      offsets.push(idx >= 0 ? idx : searchFrom);
      if (idx >= 0) searchFrom = idx;
      continue;
    }

    const needles = [
      trimmed.slice(0, 96),
      trimmed.split(/\s+/).slice(0, 10).join(" "),
      trimmed.slice(0, 48),
    ].filter((needle) => needle.length >= 16);

    let found = -1;
    for (const needle of needles) {
      found = content.indexOf(needle, searchFrom);
      if (found >= 0) break;
    }

    if (found < 0) {
      found = content.indexOf(trimmed.slice(0, 32), searchFrom);
    }

    offsets.push(found >= 0 ? found : searchFrom);
    if (found >= 0) searchFrom = found;
  }

  return offsets;
}

export function findPageForContentOffset(
  pageOffsets: number[],
  targetOffset: number,
): number {
  if (!pageOffsets.length) return 0;

  let page = 0;
  for (let index = 0; index < pageOffsets.length; index += 1) {
    if ((pageOffsets[index] ?? 0) <= targetOffset) {
      page = index;
    }
  }

  return page;
}

export function activeTocIndex(
  entries: ResolvedTocEntry[],
  scrollTop: number,
  contentLength: number,
  scrollElement?: { scrollHeight: number; clientHeight: number } | null,
): number {
  if (!entries.length) return -1;

  const maxScroll = scrollElement
    ? scrollElement.scrollHeight - scrollElement.clientHeight
    : 0;
  const charPosition =
    maxScroll > 0 ? (scrollTop / maxScroll) * contentLength : 0;

  let active = 0;
  for (let index = 0; index < entries.length; index += 1) {
    const threshold = entries[index]?.offset ?? 0;
    if (threshold <= charPosition + 80) {
      active = index;
    }
  }

  return active;
}

export function anchorIdForTocIndex(index: number): string {
  return `ikawe-toc-${index}`;
}
