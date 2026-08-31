export type ReaderTheme = "paper" | "sepia" | "dark" | "contrast" | "xteink";

export type ReadingMode = "scroll" | "paginate";

export type ReaderSettings = {
  theme: ReaderTheme;
  readingMode: ReadingMode;
  fontSize: number;
  lineHeight: number;
  marginScale: number;
  fontFamily: "serif" | "literary" | "mono" | "fast";
  greyscaleImages: boolean;
};

export const defaultReaderSettings: ReaderSettings = {
  theme: "paper",
  readingMode: "scroll",
  fontSize: 18,
  lineHeight: 1.65,
  marginScale: 1,
  fontFamily: "serif",
  greyscaleImages: false,
};

export type ReaderProgress = {
  bookId: string;
  percent: number;
  pageIndex?: number;
  scrollTop?: number;
  updatedAt: string;
};
