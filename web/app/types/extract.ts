import type { BookTocEntry } from "~/types/toc";

export type ExtractedBookResponse = {
  title: string;
  author: string;
  content: string;
  format: string;
  word_count: number;
  cover_image?: string | null;
  toc?: BookTocEntry[];
  metadata?: Record<string, unknown>;
};

export type ExtractBookErrorResponse = {
  error: string;
};
