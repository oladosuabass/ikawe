<script setup lang="ts">
import type { ReaderSettings } from "~/types/reader";
import type { TocAnchor } from "~/utils/readerContent";

const props = defineProps<{
  content: string;
  settings: ReaderSettings;
  scrollTop?: number;
  scrollToAnchorId?: string | null;
  tocAnchors?: TocAnchor[];
}>();

const emit = defineEmits<{
  scroll: [
    payload: {
      scrollTop: number;
      percent: number;
      scrollHeight: number;
      clientHeight: number;
    },
  ];
  toggleChrome: [];
}>();

const scrollRef = ref<HTMLElement | null>(null);
const restored = ref(false);

function onScroll() {
  const element = scrollRef.value;
  if (!element) return;

  const maxScroll = element.scrollHeight - element.clientHeight;
  const percent =
    maxScroll > 0 ? Math.round((element.scrollTop / maxScroll) * 100) : 0;

  emit("scroll", {
    scrollTop: element.scrollTop,
    percent,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  });
}

function applyScrollTop(value: number) {
  if (!scrollRef.value) return;
  scrollRef.value.scrollTop = value;
  restored.value = true;
  onScroll();
}

function scrollToAnchor(anchorId: string) {
  const container = scrollRef.value;
  if (!container) return;

  const anchor = container.querySelector<HTMLElement>(
    `#${CSS.escape(anchorId)}`,
  );
  if (!anchor) return;

  const containerTop = container.getBoundingClientRect().top;
  const anchorTop = anchor.getBoundingClientRect().top;
  const targetTop = container.scrollTop + (anchorTop - containerTop) - 16;

  applyScrollTop(Math.max(0, targetTop));
}

function onTap(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const ratio = x / rect.width;

  if (ratio > 0.28 && ratio < 0.72) {
    emit("toggleChrome");
  }
}

watch(
  () => props.scrollTop,
  (value) => {
    if (restored.value || value == null || !scrollRef.value) return;
    applyScrollTop(value);
  },
  { immediate: true },
);

watch(
  () => props.scrollToAnchorId,
  (anchorId) => {
    if (!anchorId) return;
    nextTick(() => scrollToAnchor(anchorId));
  },
);

onMounted(() => {
  if (props.scrollTop != null && scrollRef.value && !restored.value) {
    applyScrollTop(props.scrollTop);
  }
});

defineExpose({
  scrollToAnchor,
});
</script>

<template>
  <section
    ref="scrollRef"
    class="eink-scroll"
    :style="{
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      paddingInline: `${3 * settings.marginScale}rem`,
      paddingTop: `${5 * settings.marginScale}rem`,
      paddingBottom: `${4.75 * settings.marginScale}rem`,
    }"
    @scroll.passive="onScroll"
    @click="onTap">
    <div class="eink-scroll__grain" aria-hidden="true" />
    <article class="eink-scroll__paper">
      <ReaderContent
        :content="content"
        :bionic="settings.fontFamily === 'fast'"
        :greyscale-images="settings.greyscaleImages"
        :toc-anchors="tocAnchors" />
    </article>
  </section>
</template>

<style scoped>
.eink-scroll {
  position: relative;
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--reader-bg);
  color: var(--reader-text);
  font-family: var(--reader-font);
  -webkit-overflow-scrolling: touch;
}

.eink-scroll__grain {
  position: fixed;
  inset: 0;
  opacity: 0.35;
  pointer-events: none;
  background-image: radial-gradient(
    rgba(0, 0, 0, 0.035) 0.6px,
    transparent 0.6px
  );
  background-size: 4px 4px;
  mix-blend-mode: multiply;
}

.eink-scroll__paper {
  position: relative;
  width: min(44rem, 100%);
  margin: 0 auto;
  padding-bottom: 6rem;
}
</style>
