export type ReaderBlock =
  | { type: "text"; value: string }
  | { type: "image"; src: string }
  | { type: "anchor"; id: string };

export type TocAnchor = {
  id: string;
  offset: number;
};

const IMAGE_MARKER = /\{\{IKAWE_IMAGE:([^}]+)\}\}/g;

export function isReaderImageBlock(text: string): boolean {
  return /^\{\{IKAWE_IMAGE:[^}]+\}\}$/.test(text.trim());
}

export function parseReaderContent(content: string): ReaderBlock[] {
  if (!content) return [{ type: "text", value: "" }];

  const blocks: ReaderBlock[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(IMAGE_MARKER)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      const text = content.slice(lastIndex, index);
      if (text.trim()) {
        blocks.push({ type: "text", value: text });
      }
    }

    const src = match[1]?.trim();
    if (src) {
      blocks.push({ type: "image", src });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    if (text.trim()) {
      blocks.push({ type: "text", value: text });
    }
  }

  return blocks.length ? blocks : [{ type: "text", value: content }];
}

export function buildReaderSegments(
  content: string,
  anchors: TocAnchor[] = [],
): ReaderBlock[] {
  if (!anchors.length) {
    return parseReaderContent(content);
  }

  const sorted = [...anchors].sort((a, b) => a.offset - b.offset);
  const segments: ReaderBlock[] = [];
  let cursor = 0;

  for (const anchor of sorted) {
    const offset = Math.max(0, Math.min(content.length, anchor.offset));

    if (offset > cursor) {
      segments.push(...parseReaderContent(content.slice(cursor, offset)));
    }

    segments.push({ type: "anchor", id: anchor.id });
    cursor = offset;
  }

  if (cursor < content.length) {
    segments.push(...parseReaderContent(content.slice(cursor)));
  }

  return segments.length ? segments : parseReaderContent(content);
}
