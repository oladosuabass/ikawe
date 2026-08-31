<script setup lang="ts">
import type { ReaderSettings } from "~/types/reader";

const props = defineProps<{
  content: string;
  settings: ReaderSettings;
  pageIndex: number;
  pageCount: number;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  toggleChrome: [];
}>();

const swipeStartX = ref<number | null>(null);
const swipeStartY = ref<number | null>(null);
const slideDirection = ref<"left" | "right" | null>(null);

function onTouchStart(event: TouchEvent) {
  swipeStartX.value = event.touches[0]?.clientX ?? null;
  swipeStartY.value = event.touches[0]?.clientY ?? null;
}

function onTouchMove(event: TouchEvent) {
  if (swipeStartX.value == null) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaY = Math.abs(touch.clientY - (swipeStartY.value ?? 0));
  const deltaX = Math.abs(touch.clientX - swipeStartX.value);

  if (deltaX > deltaY && deltaX > 8) {
    event.preventDefault();
  }
}

function onTouchEnd(event: TouchEvent) {
  const startX = swipeStartX.value;
  const startY = swipeStartY.value;
  swipeStartX.value = null;
  swipeStartY.value = null;

  if (startX == null || startY == null) return;

  const touch = event.changedTouches[0];
  if (!touch) return;

  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;

  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;

  if (deltaX < 0) {
    slideDirection.value = "left";
    emit("next");
  } else {
    slideDirection.value = "right";
    emit("prev");
  }

  window.setTimeout(() => {
    slideDirection.value = null;
  }, 220);
}

function onTap(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const ratio = x / rect.width;

  if (ratio <= 0.28) {
    slideDirection.value = "right";
    emit("prev");
    window.setTimeout(() => {
      slideDirection.value = null;
    }, 220);
    return;
  }

  if (ratio >= 0.72) {
    slideDirection.value = "left";
    emit("next");
    window.setTimeout(() => {
      slideDirection.value = null;
    }, 220);
    return;
  }

  emit("toggleChrome");
}
</script>

<template>
  <section
    class="page-turn"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend.passive="onTouchEnd"
    @click="onTap">
    <Transition
      :name="
        slideDirection === 'left'
          ? 'page-left'
          : slideDirection === 'right'
            ? 'page-right'
            : 'page-fade'
      "
      mode="out-in">
      <EinkPage
        :key="pageIndex"
        :content="content"
        :settings="settings"
        :page-index="pageIndex"
        :page-count="pageCount" />
    </Transition>
  </section>
</template>

<style scoped>
.page-turn {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: pan-x;
}

.page-fade-enter-active,
.page-fade-leave-active,
.page-left-enter-active,
.page-left-leave-active,
.page-right-enter-active,
.page-right-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.page-left-enter-from {
  opacity: 0;
  transform: translateX(28px);
}

.page-left-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}

.page-right-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}

.page-right-leave-to {
  opacity: 0;
  transform: translateX(28px);
}
</style>
