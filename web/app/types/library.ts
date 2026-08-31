import type { BookTocEntry } from "~/types/toc";

export type LibraryBook = {
  id: string;
  title: string;
  author: string;
  format: "txt" | "pdf" | "epub" | "demo";
  addedAt: string;
  coverColor: string;
  hasCover?: boolean;
  hasToc?: boolean;
  wordCount: number;
};

export type LibraryBookWithContent = LibraryBook & {
  content: string;
  toc?: BookTocEntry[];
};
