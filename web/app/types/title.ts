/** Matches the Supabase `titles` table schema. */
export interface Title {
  id: string;
  added_at: string;
  updated_at: string;
  title: string;
  author: string;
  description: string | null;
  genre: string;
  isbn: string | null;
  asin: string | null;
  language: string;
  pub_date: string;
  series: string | null;
  publisher: string | null;
  source_url: string;
  format: string;
  total_pages: number | null;
  total_char_length: number | null;
  total_word_length: number | null;
  cover_image_url: string;
  file_url: string;
  rating: number | null;
  narattor: string | null;
  chapters: TitleChapter[];
  worker_id: string | null;
  tag: string | null;
}

export interface TitleChapter {
  title: string;
  content: string;
}

/** Mock-only fields until stored in the database. */
export interface MockTitleExtras {
  summary_audio_url?: string;
  audiobook_url?: string;
}

export type MockTitle = Title & MockTitleExtras;
