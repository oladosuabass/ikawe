<script setup lang="ts">
import type { ReaderSettings } from "~/types/reader";

const props = defineProps<{
  settings: ReaderSettings;
  title: string;
  author: string;
  pageIndex: number;
  pageCount: number;
  progressPercent: number;
  chromeVisible: boolean;
  settingsOpen: boolean;
  tocAvailable?: boolean;
  currentTocTitle?: string | null;
}>();

const emit = defineEmits<{
  back: [];
  toggleSettings: [];
  toggleToc: [];
  prev: [];
  next: [];
  toggleChrome: [];
}>();

const isPaginate = computed(() => props.settings.readingMode === "paginate");

const progressLabel = computed(() => {
  if (isPaginate.value) {
    return `Page ${props.pageIndex + 1} of ${props.pageCount}`;
  }
  return `${props.progressPercent}% read`;
});
</script>

<template>
  <div
    class="reader-chrome"
    :class="{ 'reader-chrome--hidden': !chromeVisible }">
    <header class="reader-chrome__top">
      <button type="button" class="reader-chrome__ghost" @click="emit('back')">
        ← Library
      </button>

      <div class="reader-chrome__title">
        <strong>{{ title }}</strong>
        <span>{{ author }}</span>
      </div>

      <div class="reader-chrome__actions">
        <button
          v-if="tocAvailable"
          type="button"
          class="reader-chrome__ghost"
          aria-label="Table of contents"
          @click="emit('toggleToc')">
          Contents
        </button>
        <button
          type="button"
          class="reader-chrome__ghost"
          :aria-expanded="settingsOpen"
          @click="emit('toggleSettings')">
          Aa
        </button>
      </div>
    </header>

    <footer class="reader-chrome__bottom">
      <div class="reader-chrome__progress">
        <span :style="{ width: `${progressPercent}%` }" />
      </div>
      <div class="reader-chrome__meta">
        <span>{{ progressLabel }}</span>
        <button
          v-if="tocAvailable && currentTocTitle"
          type="button"
          class="reader-chrome__toc-current"
          aria-label="Open table of contents"
          @click="emit('toggleToc')">
          {{ currentTocTitle }}
        </button>
      </div>
    </footer>

    <template v-if="isPaginate">
      <button
        type="button"
        class="reader-chrome__tap reader-chrome__tap--left"
        aria-label="Previous page"
        @click="emit('prev')" />
      <button
        type="button"
        class="reader-chrome__tap reader-chrome__tap--right"
        aria-label="Next page"
        @click="emit('next')" />
      <button
        type="button"
        class="reader-chrome__tap reader-chrome__tap--center"
        aria-label="Toggle controls"
        @click="emit('toggleChrome')" />
    </template>
  </div>
</template>

<style scoped>
.reader-chrome {
  position: fixed;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

.reader-chrome--hidden {
  opacity: 0;
}

.reader-chrome--hidden .reader-chrome__top,
.reader-chrome--hidden .reader-chrome__bottom,
.reader-chrome--hidden .reader-chrome__tap--left,
.reader-chrome--hidden .reader-chrome__tap--right {
  pointer-events: none;
}

.reader-chrome--hidden .reader-chrome__top,
.reader-chrome--hidden .reader-chrome__bottom {
  transform: translateY(-12px);
  opacity: 0;
}

.reader-chrome__top,
.reader-chrome__bottom {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: auto;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.reader-chrome__top {
  top: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--reader-border);
  background: var(--reader-chrome);
  backdrop-filter: blur(12px);
}

.reader-chrome__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.reader-chrome__bottom {
  bottom: 0;
  padding: 0.85rem 1rem 1rem;
  border-top: 1px solid var(--reader-border);
  background: var(--reader-chrome);
  backdrop-filter: blur(12px);
}

.reader-chrome__ghost {
  border: 0;
  background: transparent;
  color: var(--reader-text);
  cursor: pointer;
  font-size: 0.92rem;
}

.reader-chrome__title {
  min-width: 0;
  text-align: center;
}

.reader-chrome__title strong,
.reader-chrome__title span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-chrome__title strong {
  font-size: 0.92rem;
  font-weight: 600;
}

.reader-chrome__title span {
  color: var(--reader-muted);
  font-size: 0.78rem;
}

.reader-chrome__progress {
  height: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--reader-text) 10%, transparent);
  overflow: hidden;
}

.reader-chrome__progress span {
  display: block;
  height: 100%;
  background: var(--reader-accent);
}

.reader-chrome__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.55rem;
  color: var(--reader-muted);
  font-size: 0.78rem;
}

.reader-chrome__toc-current {
  min-width: 0;
  max-width: min(16rem, 52vw);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--reader-text);
  font: inherit;
  text-align: right;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-chrome__toc-current:hover {
  color: var(--reader-accent);
}

.reader-chrome__tap {
  position: absolute;
  top: 4.5rem;
  bottom: 4.5rem;
  border: 0;
  background: transparent;
  pointer-events: auto;
  cursor: pointer;
}

.reader-chrome__tap--left {
  left: 0;
  width: 28%;
}

.reader-chrome__tap--center {
  left: 28%;
  width: 44%;
}

.reader-chrome__tap--right {
  right: 0;
  width: 28%;
}
</style>
