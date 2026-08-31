import {
  defaultReaderSettings,
  type ReaderProgress,
  type ReaderSettings,
} from "~/types/reader";

const SETTINGS_KEY = "ikawe-reader-settings-v1";
const PROGRESS_KEY = "ikawe-reader-progress-v1";

export function useReaderSettings() {
  const settings = useState<ReaderSettings>("reader-settings", () => ({
    ...defaultReaderSettings,
  }));
  const progressMap = useState<Record<string, ReaderProgress>>(
    "reader-progress",
    () => ({}),
  );

  function hydrate() {
    if (!import.meta.client) return;

    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      try {
        settings.value = {
          ...defaultReaderSettings,
          ...(JSON.parse(storedSettings) as ReaderSettings),
        };
      } catch {
        settings.value = { ...defaultReaderSettings };
      }
    }

    const storedProgress = localStorage.getItem(PROGRESS_KEY);
    if (storedProgress) {
      try {
        progressMap.value = JSON.parse(storedProgress) as Record<
          string,
          ReaderProgress
        >;
      } catch {
        progressMap.value = {};
      }
    }
  }

  function persistSettings() {
    if (!import.meta.client) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value));
  }

  function persistProgress() {
    if (!import.meta.client) return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap.value));
  }

  function updateSettings(patch: Partial<ReaderSettings>) {
    settings.value = { ...settings.value, ...patch };
    persistSettings();
  }

  function saveProgress(
    bookId: string,
    percent: number,
    extras?: Pick<ReaderProgress, "pageIndex" | "scrollTop">,
  ) {
    progressMap.value = {
      ...progressMap.value,
      [bookId]: {
        bookId,
        percent,
        pageIndex: extras?.pageIndex,
        scrollTop: extras?.scrollTop,
        updatedAt: new Date().toISOString(),
      },
    };
    persistProgress();
  }

  function getProgress(bookId: string): ReaderProgress | undefined {
    return progressMap.value[bookId];
  }

  onMounted(hydrate);

  return {
    settings,
    updateSettings,
    saveProgress,
    getProgress,
    hydrate,
  };
}
