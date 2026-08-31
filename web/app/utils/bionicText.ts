export type BionicPart =
  | { type: "space"; value: string }
  | { type: "word"; bold: string; rest: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function bionicBoldLength(word: string): number {
  return Math.max(1, Math.ceil(word.length / 2));
}

export function tokenizeBionic(text: string): BionicPart[] {
  const parts: BionicPart[] = [];
  const pattern = /(\s+|\S+)/g;

  for (const token of text.match(pattern) ?? []) {
    if (/^\s+$/.test(token)) {
      parts.push({ type: "space", value: token });
      continue;
    }

    const boldLength = bionicBoldLength(token);
    parts.push({
      type: "word",
      bold: token.slice(0, boldLength),
      rest: token.slice(boldLength),
    });
  }

  return parts;
}

export function toBionicHtml(text: string): string {
  return text.replace(/\S+/g, (word) => {
    const boldLength = bionicBoldLength(word);
    const bold = escapeHtml(word.slice(0, boldLength));
    const rest = escapeHtml(word.slice(boldLength));
    return `<strong>${bold}</strong>${rest}`;
  });
}

export function isFastFont(
  fontFamily: "serif" | "literary" | "mono" | "fast",
): boolean {
  return fontFamily === "fast";
}
