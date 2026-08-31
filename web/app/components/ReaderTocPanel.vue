<script setup lang="ts">
import type { ResolvedTocEntry } from "~/types/toc";

const props = defineProps<{
  open: boolean;
  entries: ResolvedTocEntry[];
  activeIndex: number;
}>();

const emit = defineEmits<{
  close: [];
  navigate: [entry: ResolvedTocEntry, index: number];
}>();
</script>

<template>
  <Transition name="panel">
    <aside
      v-if="open"
      class="toc-panel"
      role="dialog"
      aria-label="Table of contents"
    >
      <div class="toc-panel__header">
        <h2>Contents</h2>
        <button type="button" aria-label="Close contents" @click="emit('close')">
          ×
        </button>
      </div>

      <nav v-if="entries.length" class="toc-panel__list">
        <button
          v-for="(entry, index) in entries"
          :key="`${entry.title}-${index}`"
          type="button"
          class="toc-panel__item"
          :class="{ 'toc-panel__item--active': index === activeIndex }"
          :style="{ paddingLeft: `${0.75 + (entry.level - 1) * 1.1}rem` }"
          @click="emit('navigate', entry, index)"
        >
          <span>{{ entry.title }}</span>
          <small v-if="entry.page">{{ entry.page }}</small>
        </button>
      </nav>

      <p v-else class="toc-panel__empty">
        No table of contents is available for this book.
      </p>
    </aside>
  </Transition>
</template>

<style scoped>
.toc-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 40;
  width: min(22rem, 100vw);
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--reader-chrome, rgba(244, 241, 234, 0.98));
  color: var(--reader-text);
  border-left: 1px solid var(--reader-border, rgba(31, 28, 24, 0.12));
  box-shadow: -18px 0 40px rgba(31, 28, 24, 0.08);
}

.toc-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--reader-border, rgba(31, 28, 24, 0.12));
}

.toc-panel__header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.toc-panel__header button {
  border: 0;
  background: transparent;
  color: var(--reader-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.toc-panel__list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0 1.5rem;
}

.toc-panel__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.72rem 1rem 0.72rem 0.75rem;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.toc-panel__item span {
  line-height: 1.35;
}

.toc-panel__item small {
  flex-shrink: 0;
  color: var(--reader-muted);
  font-size: 0.72rem;
}

.toc-panel__item:hover,
.toc-panel__item--active {
  background: color-mix(in srgb, var(--reader-accent, #3d5a4c) 10%, transparent);
}

.toc-panel__item--active span {
  font-weight: 600;
}

.toc-panel__empty {
  margin: 0;
  padding: 1.5rem 1.1rem;
  color: var(--reader-muted);
  line-height: 1.5;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
