import type { MockTitle, Title } from "~/types/title";
import { genrePath, slugify, titlePath } from "~/utils/slug";

export function useTitles() {
  async function fetchTitles(params?: { q?: string; genre?: string }) {
    return await $fetch<MockTitle[]>("/api/titles", { query: params });
  }

  async function fetchTitle(id: string) {
    return await $fetch<MockTitle>(`/api/titles/${id}`);
  }

  function formatDuration(wordCount: number | null) {
    if (!wordCount) return "—";
    const minutes = Math.max(1, Math.round(wordCount / 200));
    return `${minutes} min read`;
  }

  function splitGenres(genre: string) {
    return genre
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
  }

  function collectGenres(titles: MockTitle[]) {
    const set = new Set<string>();
    for (const title of titles) {
      for (const genre of splitGenres(title.genre)) set.add(genre);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }

  function filterByGenreSlug(titles: MockTitle[], genreSlug: string) {
    return titles.filter((title) =>
      splitGenres(title.genre).some((genre) => slugify(genre) === genreSlug),
    );
  }

  function findGenreBySlug(titles: MockTitle[], genreSlug: string) {
    for (const title of titles) {
      for (const genre of splitGenres(title.genre)) {
        if (slugify(genre) === genreSlug) return genre;
      }
    }
    return null;
  }

  function groupByGenreSections(titles: MockTitle[], limit = 4) {
    const genres = collectGenres(titles);
    return genres
      .map((genre) => ({
        genre,
        slug: slugify(genre),
        titles: titles
          .filter((title) =>
            splitGenres(title.genre).some((g) => slugify(g) === slugify(genre)),
          )
          .slice(0, limit),
      }))
      .filter((section) => section.titles.length > 0);
  }

  return {
    fetchTitles,
    fetchTitle,
    formatDuration,
    splitGenres,
    collectGenres,
    filterByGenreSlug,
    findGenreBySlug,
    groupByGenreSections,
    slugify,
    titlePath,
    genrePath,
  };
}

export type { Title, MockTitle };
