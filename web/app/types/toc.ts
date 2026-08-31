export type BookTocEntry = {
  level: number;
  title: string;
  page?: number | null;
  offset?: number | null;
};

export type ResolvedTocEntry = BookTocEntry & {
  offset: number;
};
