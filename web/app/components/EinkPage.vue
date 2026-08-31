<script setup lang="ts">
import type { ReaderSettings } from "~/types/reader";

defineProps<{
  content: string;
  settings: ReaderSettings;
  pageIndex: number;
  pageCount: number;
}>();
</script>

<template>
  <section
    class="eink-page"
    :style="{
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      paddingInline: `${3 * settings.marginScale}rem`,
      paddingTop: `${4.75 * settings.marginScale}rem`,
      paddingBottom: `${3.5 * settings.marginScale}rem`,
    }">
    <div class="eink-page__paper">
      <div class="eink-page__grain" aria-hidden="true" />
      <div class="eink-page__frame">
        <ReaderContent
          :content="content"
          :bionic="settings.fontFamily === 'fast'"
          :greyscale-images="settings.greyscaleImages" />
      </div>
      <p class="eink-page__number">{{ pageIndex + 1 }} / {{ pageCount }}</p>
    </div>
  </section>
</template>

<style scoped>
.eink-page {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--reader-bg);
  color: var(--reader-text);
  font-family: var(--reader-font);
  touch-action: manipulation;
}

.eink-page__paper {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(44rem, 100%);
  height: calc(100dvh - 5.5rem);
  max-height: calc(100dvh - 5.5rem);
  padding: 1.5rem 0 3.25rem;
  overflow: hidden;
}

.eink-page__frame {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.eink-page__grain {
  position: absolute;
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

.eink-page__text {
  position: relative;
  margin: 0;
  white-space: pre-wrap;
  text-align: justify;
  hyphens: auto;
  text-indent: 1.5em;
  overflow: hidden;
}

.eink-page__number {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.85rem;
  margin: 0;
  color: var(--reader-muted);
  font-size: 0.78rem;
  text-align: center;
}
</style>
