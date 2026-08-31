import { toBionicHtml } from "~/utils/bionicText";
import { isReaderImageBlock } from "~/utils/readerContent";

const FONT_FAMILIES = {
  serif: '"Literata", Georgia, "Iowan Old Style", serif',
  literary: 'Georgia, "Times New Roman", Times, serif',
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  fast: '"Literata", Georgia, "Iowan Old Style", serif',
} as const;

export type PaginateOptions = {
  content: string;
  viewportWidth: number;
  viewportHeight: number;
  fontSize: number;
  lineHeight: number;
  marginScale: number;
  fontFamily: keyof typeof FONT_FAMILIES;
  contentBox?: { width: number; height: number };
};

function resolveFontFamily(fontFamily: PaginateOptions["fontFamily"]): string {
  return FONT_FAMILIES[fontFamily];
}

function rootFontSize(): number {
  if (!import.meta.client) return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/** Mirrors `.eink-page` / `.eink-page__paper` / `.eink-page__frame` layout. */
export function getPageContentBox(options: PaginateOptions): {
  width: number;
  height: number;
} {
  if (options.contentBox) return options.contentBox;

  const rootPx = rootFontSize();
  const inlinePad = 3 * options.marginScale * rootPx;
  const paperHeight = options.viewportHeight - 5.5 * rootPx;
  const frameHeight = paperHeight - 1.5 * rootPx - 3.25 * rootPx;
  const width = Math.min(
    704,
    Math.max(240, options.viewportWidth - inlinePad * 2),
  );

  return {
    width,
    height: Math.max(240, frameHeight),
  };
}

function createMeasurer(
  options: PaginateOptions,
  box: { width: number; height: number },
): HTMLDivElement {
  const measurer = document.createElement("div");
  measurer.style.position = "fixed";
  measurer.style.left = "-9999px";
  measurer.style.top = "0";
  measurer.style.visibility = "hidden";
  measurer.style.pointerEvents = "none";
  measurer.style.boxSizing = "border-box";
  measurer.style.width = `${box.width}px`;
  measurer.style.height = `${box.height}px`;
  measurer.style.margin = "0";
  measurer.style.padding = "0";
  measurer.style.border = "0";
  measurer.style.fontSize = `${options.fontSize}px`;
  measurer.style.lineHeight = String(options.lineHeight);
  measurer.style.fontFamily = resolveFontFamily(options.fontFamily);
  measurer.style.textAlign = "justify";
  measurer.style.hyphens = "auto";
  measurer.style.whiteSpace = "pre-wrap";
  measurer.style.textIndent = "1.5em";
  measurer.style.overflow = "hidden";
  if (options.fontFamily === "fast") {
    measurer.style.fontWeight = "400";
  }

  document.body.appendChild(measurer);
  return measurer;
}

function setMeasurerText(
  measurer: HTMLDivElement,
  text: string,
  bionic: boolean,
) {
  if (isReaderImageBlock(text)) {
    const src = text.match(/\{\{IKAWE_IMAGE:([^}]+)\}\}/)?.[1] ?? "";
    measurer.innerHTML = src
      ? `<figure style="margin:0"><img src="${src}" alt="" style="display:block;width:100%;max-height:min(70vh,36rem);object-fit:contain" /></figure>`
      : "";
    return;
  }

  if (bionic) {
    measurer.innerHTML = toBionicHtml(text);
  } else {
    measurer.textContent = text;
  }
}

function textFits(
  measurer: HTMLDivElement,
  text: string,
  bionic = false,
): boolean {
  setMeasurerText(measurer, text, bionic);
  return measurer.scrollHeight <= measurer.clientHeight + 2;
}

function splitWordsToPages(
  measurer: HTMLDivElement,
  paragraph: string,
  bionic: boolean,
): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean);
  const pages: string[] = [];
  let chunk = "";

  for (const word of words) {
    const candidate = chunk ? `${chunk} ${word}` : word;
    if (textFits(measurer, candidate, bionic)) {
      chunk = candidate;
      continue;
    }

    if (chunk) pages.push(chunk);
    chunk = word;
  }

  if (chunk) pages.push(chunk);
  return pages;
}

function optimizePageFill(
  pages: string[],
  measurer: HTMLDivElement,
  bionic: boolean,
): string[] {
  if (pages.length < 2) return pages;

  const result = [...pages];

  for (let index = 0; index < result.length - 1; index += 1) {
    if (
      isReaderImageBlock(result[index] ?? "") ||
      isReaderImageBlock(result[index + 1] ?? "")
    ) {
      continue;
    }

    let current = result[index] ?? "";
    let next = result[index + 1] ?? "";

    while (next.trim()) {
      const nextWords = next.split(/\s+/).filter(Boolean);
      const word = nextWords[0];
      if (!word) break;

      const candidate = current ? `${current} ${word}` : word;
      if (!textFits(measurer, candidate, bionic)) break;

      current = candidate;
      next = nextWords.slice(1).join(" ");
    }

    result[index] = current;
    result[index + 1] = next;
  }

  return result.filter((page) => page.trim());
}

export function paginateTextDom(options: PaginateOptions): string[] {
  if (!import.meta.client || !options.content.trim()) return [""];

  const bionic = options.fontFamily === "fast";
  const box = getPageContentBox(options);
  const measurer = createMeasurer(options, box);

  try {
    const paragraphs = options.content
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (!paragraphs.length) return [""];

    const pages: string[] = [];
    let current = "";

    for (const paragraph of paragraphs) {
      if (isReaderImageBlock(paragraph)) {
        if (current) {
          pages.push(current);
          current = "";
        }
        pages.push(paragraph.trim());
        continue;
      }

      const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

      if (textFits(measurer, candidate, bionic)) {
        current = candidate;
        continue;
      }

      if (current) {
        pages.push(current);
        current = "";
      }

      if (textFits(measurer, paragraph, bionic)) {
        current = paragraph;
        continue;
      }

      const wordPages = splitWordsToPages(measurer, paragraph, bionic);
      if (wordPages.length > 1) {
        pages.push(...wordPages.slice(0, -1));
        current = wordPages[wordPages.length - 1] ?? "";
      } else if (wordPages.length === 1) {
        current = wordPages[0];
      }
    }

    if (current) pages.push(current);

    const filled = optimizePageFill(
      pages.length ? pages : [""],
      measurer,
      bionic,
    );
    return filled.length ? filled : [""];
  } finally {
    measurer.remove();
  }
}

/** Fallback estimate for SSR / first paint before DOM measurement runs. */
export function paginateText(content: string, charsPerPage: number): string[] {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) return [""];

  const pages: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= charsPerPage) {
      current = candidate;
      continue;
    }

    if (current) pages.push(current);

    if (paragraph.length <= charsPerPage) {
      current = paragraph;
      continue;
    }

    const words = paragraph.split(/\s+/).filter(Boolean);
    current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= charsPerPage) {
        current = next;
      } else {
        if (current) pages.push(current);
        current = word;
      }
    }
  }

  if (current) pages.push(current);
  return pages.length ? pages : [""];
}

export function estimateCharsPerPage(options: {
  fontSize: number;
  lineHeight: number;
  marginScale: number;
  viewportHeight: number;
  viewportWidth: number;
}): number {
  const box = getPageContentBox({
    content: "",
    viewportWidth: options.viewportWidth,
    viewportHeight: options.viewportHeight,
    fontSize: options.fontSize,
    lineHeight: options.lineHeight,
    marginScale: options.marginScale,
    fontFamily: "serif",
  });

  const avgCharWidth = options.fontSize * 0.52;
  const lineCount = Math.floor(
    box.height / (options.fontSize * options.lineHeight),
  );
  const charsPerLine = Math.floor(box.width / avgCharWidth);
  return Math.max(280, lineCount * charsPerLine);
}
