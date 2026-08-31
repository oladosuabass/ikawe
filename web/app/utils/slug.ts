export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function titlePath(title: { id: string; title: string }) {
  return `/titles/${slugify(title.title)}/${title.id}`;
}

export function genrePath(genre: string) {
  return `/genres/${slugify(genre)}`;
}
