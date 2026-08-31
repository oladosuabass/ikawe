import { mockTitles } from "~/data/mock-titles";
import { slugify, splitGenres } from "../../utils/slug";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const search = String(query.q || "")
    .trim()
    .toLowerCase();
  const genre = String(query.genre || "")
    .trim()
    .toLowerCase();

  let results = mockTitles;

  if (search) {
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(search) ||
        t.author.toLowerCase().includes(search) ||
        (t.description || "").toLowerCase().includes(search),
    );
  }

  if (genre) {
    results = results.filter((t) =>
      splitGenres(t.genre).some(
        (g) => slugify(g) === genre || g.toLowerCase() === genre,
      ),
    );
  }

  return results;
});
