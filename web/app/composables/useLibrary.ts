import { demoBooks } from "~/data/demo-books";
import type { LibraryBook, LibraryBookWithContent } from "~/types/library";
import { parseBookFile } from "~/utils/parseBookFile";
import { buildTocForContent } from "~/utils/tocNavigation";
import {
  deleteBookContent,
  getBookContent,
  getBookCover,
  getBookToc,
  loadLibraryMeta,
  migrateLegacyLibrary,
  saveBookContent,
  saveBookCover,
  saveBookToc,
  saveLibraryMeta,
} from "~/utils/bookStore";

export function useLibrary() {
  const books = useState<LibraryBook[]>("library-books", () => []);
  const hydrated = useState("library-hydrated", () => false);

  async function hydrate() {
    if (!import.meta.client || hydrated.value) return;

    await migrateLegacyLibrary();

    const stored = loadLibraryMeta();
    if (stored?.length) {
      books.value = stored;
    } else {
      books.value = demoBooks.map(({ content, toc, ...meta }) => {
        const entries = toc ?? buildTocForContent(content);
        return {
          ...meta,
          hasToc: entries.length > 0,
        };
      });
      await Promise.all(
        demoBooks.map(async (book) => {
          await saveBookContent(book.id, book.content);
          const entries = book.toc ?? buildTocForContent(book.content);
          if (entries.length) {
            await saveBookToc(book.id, entries);
          }
        }),
      );
      saveLibraryMeta(books.value);
    }

    hydrated.value = true;
  }

  function persistMeta() {
    saveLibraryMeta(books.value);
  }

  function getBook(id: string): LibraryBook | undefined {
    if (import.meta.client) {
      void hydrate();
    }
    return books.value.find((book) => book.id === id);
  }

  async function getBookWithContent(
    id: string,
  ): Promise<LibraryBookWithContent | undefined> {
    await hydrate();
    const meta = books.value.find((book) => book.id === id);
    if (!meta) return undefined;

    const [content, toc] = await Promise.all([
      getBookContent(id),
      getBookToc(id),
    ]);
    if (content == null) return undefined;

    const resolvedToc = toc ?? buildTocForContent(content);

    return { ...meta, content, toc: resolvedToc };
  }

  async function addFile(file: File): Promise<LibraryBookWithContent> {
    await hydrate();
    const parsed = await parseBookFile(file);
    const { content, coverImage, toc, ...meta } = parsed;

    await saveBookContent(meta.id, content);
    if (coverImage) {
      await saveBookCover(meta.id, coverImage);
    }
    if (toc?.length) {
      await saveBookToc(meta.id, toc);
    }
    books.value = [meta, ...books.value];
    persistMeta();

    return { ...meta, content, toc };
  }

  async function removeBook(id: string) {
    await hydrate();
    books.value = books.value.filter((book) => book.id !== id);
    persistMeta();
    await deleteBookContent(id);
  }

  async function getCover(id: string): Promise<string | null> {
    await hydrate();
    return getBookCover(id);
  }

  async function getToc(id: string) {
    await hydrate();
    const stored = await getBookToc(id);
    if (stored?.length) return stored;

    const content = await getBookContent(id);
    if (!content) return [];
    return buildTocForContent(content);
  }

  onMounted(() => {
    void hydrate();
  });

  return {
    books,
    hydrate,
    getBook,
    getBookWithContent,
    getCover,
    getToc,
    addFile,
    removeBook,
  };
}
