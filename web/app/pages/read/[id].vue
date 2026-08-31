<script setup lang="ts">
import type { LibraryBook } from "~/types/library";
import type { ResolvedTocEntry } from "~/types/toc";
import {
  buildPageSettingsKey,
  ensurePaginatedPages,
  getCachedPageContentOffsets,
  getCachedPageText,
} from "~/utils/bookStore";
import {
  activeTocIndex,
  anchorIdForTocIndex,
  findPageForContentOffset,
  resolveTocAnchors,
} from "~/utils/tocNavigation";

definePageMeta({
  layout: "reader",
});

const route = useRoute();
const router = useRouter();
const { getBook, getBookWithContent } = useLibrary();
const { settings, updateSettings, saveProgress, getProgress } =
  useReaderSettings();

const bookId = computed(() => String(route.params.id));
const bookMeta = ref<LibraryBook | null>(null);
const bookContent = ref("");
const tocEntries = ref<ResolvedTocEntry[]>([]);
const loadingBook = ref(true);
const paginating = ref(false);
const loadError = ref<string | null>(null);

const chromeVisible = ref(true);
const settingsOpen = ref(false);
const tocOpen = ref(false);
const pageIndex = ref(0);
const scrollTop = ref(0);
const scrollToAnchorId = ref<string | null>(null);
const progressPercent = ref(0);
const pageCount = ref(1);
const currentPage = ref("");
const pageCacheKey = ref("");
const pageContentOffsets = ref<number[]>([]);
const scrollMetrics = ref({ scrollHeight: 0, clientHeight: 0 });
const viewport = ref({ width: 1200, height: 800 });
const measureFrameRef = ref<HTMLElement | null>(null);

const isPaginate = computed(() => settings.value.readingMode === "paginate");
const themeClass = computed(() => `reader-theme-${settings.value.theme}`);
const fontClass = computed(() => `reader-font-${settings.value.fontFamily}`);
const isReady = computed(
  () => !loadingBook.value && !paginating.value && !!bookMeta.value,
);
const tocAvailable = computed(() => tocEntries.value.length > 0);
const tocAnchors = computed(() =>
  tocEntries.value.map((entry, index) => ({
    id: anchorIdForTocIndex(index),
    offset: entry.offset,
  })),
);
const activeTocEntryIndex = computed(() => {
  if (!tocEntries.value.length || !bookContent.value) return -1;

  if (isPaginate.value) {
    if (!pageContentOffsets.value.length) return -1;
    let active = 0;
    for (let index = 0; index < tocEntries.value.length; index += 1) {
      const page = findPageForContentOffset(
        pageContentOffsets.value,
        tocEntries.value[index]?.offset ?? 0,
      );
      if (page <= pageIndex.value) {
        active = index;
      }
    }
    return active;
  }

  return activeTocIndex(
    tocEntries.value,
    scrollTop.value,
    bookContent.value.length,
    scrollMetrics.value,
  );
});

const currentTocTitle = computed(() => {
  if (!tocEntries.value.length) return null;

  const index = activeTocEntryIndex.value;
  if (index >= 0) {
    return tocEntries.value[index]?.title ?? null;
  }

  return tocEntries.value[0]?.title ?? null;
});

async function refreshPageContentOffsets() {
  if (!pageCacheKey.value) {
    pageContentOffsets.value = [];
    return;
  }

  pageContentOffsets.value =
    (await getCachedPageContentOffsets(pageCacheKey.value)) ?? [];
}

async function loadBook() {
  loadingBook.value = true;
  loadError.value = null;
  bookContent.value = "";
  tocEntries.value = [];
  bookMeta.value = getBook(bookId.value) ?? null;

  try {
    const loaded = await getBookWithContent(bookId.value);
    if (!loaded) {
      bookMeta.value = null;
      return;
    }

    const { content, toc, ...meta } = loaded;
    bookMeta.value = meta;
    bookContent.value = content;
    tocEntries.value = resolveTocAnchors(content, toc ?? []);
    restoreProgress();

    if (isPaginate.value) {
      await recalculatePages();
    }
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : "Could not open this book.";
    bookMeta.value = null;
  } finally {
    loadingBook.value = false;
  }
}

async function loadCurrentPage() {
  if (!pageCacheKey.value) {
    currentPage.value = "";
    return;
  }

  const text = await getCachedPageText(
    `${pageCacheKey.value}:${pageIndex.value}`,
  );
  currentPage.value = text ?? "";
}

async function recalculatePages() {
  if (!bookContent.value || !bookMeta.value || !import.meta.client) return;

  paginating.value = true;

  try {
    await nextTick();

    const frame = measureFrameRef.value;
    const contentBox = frame
      ? { width: frame.clientWidth, height: frame.clientHeight }
      : undefined;

    const cacheKey = buildPageSettingsKey(
      bookMeta.value.id,
      {
        fontSize: settings.value.fontSize,
        lineHeight: settings.value.lineHeight,
        marginScale: settings.value.marginScale,
        fontFamily: settings.value.fontFamily,
        viewportWidth: viewport.value.width,
        viewportHeight: viewport.value.height,
      },
      contentBox,
    );

    pageCacheKey.value = cacheKey;
    pageCount.value = await ensurePaginatedPages(cacheKey, {
      content: bookContent.value,
      viewportWidth: viewport.value.width,
      viewportHeight: viewport.value.height,
      fontSize: settings.value.fontSize,
      lineHeight: settings.value.lineHeight,
      marginScale: settings.value.marginScale,
      fontFamily: settings.value.fontFamily,
      contentBox,
    });

    clampPageIndex();
    await loadCurrentPage();
    await refreshPageContentOffsets();
    persistPaginate();
  } finally {
    paginating.value = false;
  }
}

function syncViewport() {
  viewport.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  if (isPaginate.value && bookContent.value) {
    void recalculatePages();
  }
}

function clampPageIndex() {
  const maxIndex = Math.max(pageCount.value - 1, 0);
  pageIndex.value = Math.min(pageIndex.value, maxIndex);
}

function goPrev() {
  if (!isPaginate.value) return;
  pageIndex.value = Math.max(pageIndex.value - 1, 0);
}

function goNext() {
  if (!isPaginate.value) return;
  pageIndex.value = Math.min(pageIndex.value + 1, pageCount.value - 1);
}

function persistPaginate() {
  if (!bookMeta.value) return;
  const percent = pageCount.value
    ? Math.round(((pageIndex.value + 1) / pageCount.value) * 100)
    : 0;
  progressPercent.value = percent;
  saveProgress(bookMeta.value.id, percent, { pageIndex: pageIndex.value });
}

function onScrollProgress(payload: {
  scrollTop: number;
  percent: number;
  scrollHeight: number;
  clientHeight: number;
}) {
  if (!bookMeta.value) return;
  scrollTop.value = payload.scrollTop;
  progressPercent.value = payload.percent;
  scrollMetrics.value = {
    scrollHeight: payload.scrollHeight,
    clientHeight: payload.clientHeight,
  };
  saveProgress(bookMeta.value.id, payload.percent, {
    scrollTop: payload.scrollTop,
  });
}

function restoreProgress() {
  const saved = getProgress(bookId.value);
  if (!saved) return;

  progressPercent.value = saved.percent;

  if (saved.pageIndex != null) {
    pageIndex.value = Math.max(0, saved.pageIndex);
  }

  if (saved.scrollTop != null) {
    scrollTop.value = saved.scrollTop;
  }
}

async function navigateToToc(entry: ResolvedTocEntry, index: number) {
  tocOpen.value = false;
  settingsOpen.value = false;
  chromeVisible.value = false;

  if (isPaginate.value) {
    if (!pageCacheKey.value) {
      await recalculatePages();
    }

    if (!pageContentOffsets.value.length) {
      await refreshPageContentOffsets();
    }

    pageIndex.value = findPageForContentOffset(
      pageContentOffsets.value,
      entry.offset,
    );
    persistPaginate();
    return;
  }

  scrollToAnchorId.value = null;
  await nextTick();
  scrollToAnchorId.value = anchorIdForTocIndex(index);
}

function setScrollLock(locked: boolean) {
  if (!import.meta.client) return;
  document.documentElement.style.overflow = locked ? "hidden" : "";
  document.body.style.overflow = locked ? "hidden" : "";
  document.documentElement.style.overscrollBehavior = locked ? "none" : "";
}

function onKeydown(event: KeyboardEvent) {
  if (settingsOpen.value || tocOpen.value || paginating.value) return;

  if (!isPaginate.value) {
    if (event.key === "Escape") {
      settingsOpen.value = false;
      tocOpen.value = false;
      chromeVisible.value = true;
    }
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    goPrev();
  }

  if (
    event.key === "ArrowRight" ||
    event.key === "PageDown" ||
    event.key === " "
  ) {
    event.preventDefault();
    goNext();
  }

  if (event.key === "Escape") {
    settingsOpen.value = false;
    tocOpen.value = false;
    chromeVisible.value = true;
  }
}

watch(
  () => [
    settings.value.fontSize,
    settings.value.lineHeight,
    settings.value.marginScale,
    settings.value.fontFamily,
  ],
  () => {
    if (isPaginate.value && bookContent.value) {
      void recalculatePages();
    }
  },
);

watch(isPaginate, (paginate) => {
  setScrollLock(paginate);
  if (paginate && bookContent.value) {
    void recalculatePages();
  }
});

watch(pageIndex, async () => {
  if (!isPaginate.value) return;
  await loadCurrentPage();
  persistPaginate();
});

watch(settingsOpen, (open) => {
  if (open) tocOpen.value = false;
});

watch(tocOpen, (open) => {
  if (open) settingsOpen.value = false;
});

onMounted(() => {
  syncViewport();
  setScrollLock(isPaginate.value);
  window.addEventListener("resize", syncViewport);
  window.addEventListener("keydown", onKeydown);
  void loadBook();
});

onBeforeUnmount(() => {
  setScrollLock(false);
  bookContent.value = "";
  window.removeEventListener("resize", syncViewport);
  window.removeEventListener("keydown", onKeydown);
});

useHead(() => ({
  title: bookMeta.value ? `${bookMeta.value.title} · Ikawe` : "Reader · Ikawe",
}));
</script>

<template>
  <div
    v-if="bookMeta"
    class="reader"
    :class="[themeClass, fontClass, { 'reader--paginate': isPaginate }]">
    <div
      v-if="isPaginate"
      class="reader-measure"
      :class="[themeClass, fontClass]"
      :style="{
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        paddingInline: `${3 * settings.marginScale}rem`,
        paddingTop: `${4.75 * settings.marginScale}rem`,
        paddingBottom: `${3.5 * settings.marginScale}rem`,
      }"
      aria-hidden="true">
      <div class="reader-measure__paper">
        <div ref="measureFrameRef" class="reader-measure__frame" />
      </div>
    </div>

    <div v-if="loadingBook || paginating" class="reader__loading">
      <p>{{ paginating ? "Preparing pages…" : "Opening book…" }}</p>
    </div>

    <template v-else-if="isReady">
      <EinkScrollReader
        v-if="!isPaginate"
        :content="bookContent"
        :settings="settings"
        :scroll-top="scrollTop"
        :scroll-to-anchor-id="scrollToAnchorId"
        :toc-anchors="tocAnchors"
        @scroll="onScrollProgress"
        @toggle-chrome="chromeVisible = !chromeVisible" />

      <EinkPageTurnReader
        v-else
        :content="currentPage"
        :settings="settings"
        :page-index="pageIndex"
        :page-count="pageCount"
        @prev="goPrev"
        @next="goNext"
        @toggle-chrome="chromeVisible = !chromeVisible" />
    </template>

    <ReaderChrome
      v-if="isReady"
      :settings="settings"
      :title="bookMeta.title"
      :author="bookMeta.author"
      :page-index="pageIndex"
      :page-count="pageCount"
      :progress-percent="progressPercent"
      :chrome-visible="chromeVisible"
      :settings-open="settingsOpen"
      :toc-available="tocAvailable"
      :current-toc-title="currentTocTitle"
      @back="router.push('/library')"
      @toggle-settings="settingsOpen = !settingsOpen"
      @toggle-toc="tocOpen = !tocOpen"
      @toggle-chrome="chromeVisible = !chromeVisible"
      @prev="goPrev"
      @next="goNext" />

    <ReaderSettingsPanel
      :open="settingsOpen"
      :settings="settings"
      @close="settingsOpen = false"
      @update="updateSettings" />

    <ReaderTocPanel
      :open="tocOpen"
      :entries="tocEntries"
      :active-index="activeTocEntryIndex"
      @close="tocOpen = false"
      @navigate="navigateToToc" />
  </div>

  <div v-else class="reader-missing">
    <p>{{ loadError || "This book is not on your shelf." }}</p>
    <NuxtLink to="/library">Back to library</NuxtLink>
  </div>
</template>

<style scoped>
.reader,
.reader-missing {
  min-height: 100dvh;
  background: var(--reader-bg, #f4f1ea);
  color: var(--reader-text, #1f1c18);
}

.reader--paginate {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
}

.reader__loading {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--reader-muted, #7a7268);
  font-size: 0.95rem;
}

.reader-missing {
  display: grid;
  place-content: center;
  gap: 0.75rem;
  text-align: center;
  padding: 2rem;
}

.reader-missing a {
  color: var(--accent, #3d5a4c);
}

.reader-measure {
  position: fixed;
  inset: 0;
  visibility: hidden;
  pointer-events: none;
  display: grid;
  place-items: center;
  font-family: var(--reader-font);
}

.reader-measure__paper {
  display: flex;
  flex-direction: column;
  width: min(44rem, 100%);
  height: calc(100dvh - 5.5rem);
  padding: 1.5rem 0 3.25rem;
  box-sizing: border-box;
}

.reader-measure__frame {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
