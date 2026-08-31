<script setup lang="ts">
import type { ReaderSettings, ReaderTheme, ReadingMode } from "~/types/reader";

const props = defineProps<{
  open: boolean;
  settings: ReaderSettings;
}>();

const emit = defineEmits<{
  close: [];
  update: [patch: Partial<ReaderSettings>];
}>();

const themes: { id: ReaderTheme; label: string; swatch: string }[] = [
  { id: "paper", label: "Paper", swatch: "#f4f1ea" },
  { id: "sepia", label: "Sepia", swatch: "#f2e8d5" },
  { id: "dark", label: "Dark", swatch: "#141414" },
  { id: "contrast", label: "Contrast", swatch: "#ffffff" },
  { id: "xteink", label: "Xteink", swatch: "#e8e4dc" },
];

const fonts: { id: ReaderSettings["fontFamily"]; label: string }[] = [
  { id: "serif", label: "Literata" },
  { id: "literary", label: "Georgia" },
  { id: "mono", label: "Mono" },
  { id: "fast", label: "Fast" },
];

const readingModes: { id: ReadingMode; label: string; hint: string }[] = [
  { id: "scroll", label: "Scroll", hint: "Continuous vertical reading" },
  { id: "paginate", label: "Page turn", hint: "Tap or swipe left/right" },
];
</script>

<template>
  <Transition name="panel">
    <aside
      v-if="open"
      class="settings-panel"
      role="dialog"
      aria-label="Reader settings">
      <div class="settings-panel__header">
        <h2>Reading settings</h2>
        <button
          type="button"
          aria-label="Close settings"
          @click="emit('close')">
          ×
        </button>
      </div>

      <section>
        <p class="settings-panel__label">Reading mode</p>
        <div class="settings-panel__modes">
          <button
            v-for="mode in readingModes"
            :key="mode.id"
            type="button"
            class="settings-panel__mode"
            :class="{
              'settings-panel__mode--active': settings.readingMode === mode.id,
            }"
            @click="emit('update', { readingMode: mode.id })">
            <strong>{{ mode.label }}</strong>
            <span>{{ mode.hint }}</span>
          </button>
        </div>
      </section>

      <section>
        <p class="settings-panel__label">Theme</p>
        <div class="settings-panel__themes">
          <button
            v-for="theme in themes"
            :key="theme.id"
            type="button"
            class="settings-panel__theme"
            :class="{
              'settings-panel__theme--active': settings.theme === theme.id,
            }"
            @click="emit('update', { theme: theme.id })">
            <span :style="{ background: theme.swatch }" />
            {{ theme.label }}
          </button>
        </div>
      </section>

      <section>
        <p class="settings-panel__label">Font</p>
        <div class="settings-panel__segmented">
          <button
            v-for="font in fonts"
            :key="font.id"
            type="button"
            :class="{ active: settings.fontFamily === font.id }"
            @click="emit('update', { fontFamily: font.id })">
            {{ font.label }}
          </button>
        </div>
      </section>

      <section>
        <p class="settings-panel__label">Images</p>
        <button
          type="button"
          class="settings-panel__toggle"
          :class="{
            'settings-panel__toggle--active': settings.greyscaleImages,
          }"
          role="switch"
          :aria-checked="settings.greyscaleImages"
          @click="
            emit('update', { greyscaleImages: !settings.greyscaleImages })
          ">
          <span class="settings-panel__toggle-copy">
            <strong>Greyscale illustrations</strong>
            <span>Render book images in black and white</span>
          </span>
          <span class="settings-panel__toggle-track" aria-hidden="true">
            <span class="settings-panel__toggle-thumb" />
          </span>
        </button>
      </section>

      <section>
        <label class="settings-panel__label" for="font-size">Text size</label>
        <input
          id="font-size"
          type="range"
          min="15"
          max="26"
          step="1"
          :value="settings.fontSize"
          @input="
            emit('update', {
              fontSize: Number(($event.target as HTMLInputElement).value),
            })
          " />
        <p class="settings-panel__value">{{ settings.fontSize }}px</p>
      </section>

      <section>
        <label class="settings-panel__label" for="line-height"
          >Line spacing</label
        >
        <input
          id="line-height"
          type="range"
          min="1.35"
          max="2"
          step="0.05"
          :value="settings.lineHeight"
          @input="
            emit('update', {
              lineHeight: Number(($event.target as HTMLInputElement).value),
            })
          " />
        <p class="settings-panel__value">
          {{ settings.lineHeight.toFixed(2) }}
        </p>
      </section>

      <section>
        <label class="settings-panel__label" for="margin-scale">Margins</label>
        <input
          id="margin-scale"
          type="range"
          min="0.75"
          max="1.5"
          step="0.05"
          :value="settings.marginScale"
          @input="
            emit('update', {
              marginScale: Number(($event.target as HTMLInputElement).value),
            })
          " />
        <p class="settings-panel__value">
          {{ Math.round(settings.marginScale * 100) }}%
        </p>
      </section>
    </aside>
  </Transition>
</template>

<style scoped>
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 30;
  width: min(22rem, 100vw);
  height: 100dvh;
  padding: 1.25rem;
  border-left: 1px solid var(--reader-border);
  background: var(--reader-chrome);
  color: var(--reader-text);
  backdrop-filter: blur(12px);
  overflow-y: auto;
}

.settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.settings-panel__header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.settings-panel__header button {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--reader-border);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.settings-panel section + section {
  margin-top: 1.25rem;
}

.settings-panel__label {
  margin: 0 0 0.55rem;
  color: var(--reader-muted);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.settings-panel__themes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.settings-panel__theme {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--reader-border);
  border-radius: 0.75rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.settings-panel__theme span {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  border: 1px solid var(--reader-border);
}

.settings-panel__theme--active {
  border-color: var(--reader-accent);
}

.settings-panel__modes {
  display: grid;
  gap: 0.55rem;
}

.settings-panel__mode {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--reader-border);
  border-radius: 0.75rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.settings-panel__mode strong {
  font-size: 0.92rem;
}

.settings-panel__mode span {
  color: var(--reader-muted);
  font-size: 0.78rem;
}

.settings-panel__mode--active {
  border-color: var(--reader-accent);
}

.settings-panel__segmented {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.settings-panel__segmented button {
  padding: 0.55rem 0.35rem;
  border: 1px solid var(--reader-border);
  border-radius: 0.65rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.82rem;
}

.settings-panel__segmented button.active {
  border-color: var(--reader-accent);
}

.settings-panel__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--reader-border);
  border-radius: 0.75rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.settings-panel__toggle-copy {
  display: grid;
  gap: 0.2rem;
}

.settings-panel__toggle-copy strong {
  font-size: 0.92rem;
}

.settings-panel__toggle-copy span {
  color: var(--reader-muted);
  font-size: 0.78rem;
}

.settings-panel__toggle-track {
  position: relative;
  flex-shrink: 0;
  width: 2.5rem;
  height: 1.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--reader-text) 12%, transparent);
  transition: background 0.18s ease;
}

.settings-panel__toggle-thumb {
  position: absolute;
  top: 0.15rem;
  left: 0.15rem;
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 999px;
  background: var(--reader-bg, #f4f1ea);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  transition: transform 0.18s ease;
}

.settings-panel__toggle--active .settings-panel__toggle-track {
  background: var(--reader-accent);
}

.settings-panel__toggle--active .settings-panel__toggle-thumb {
  transform: translateX(1.05rem);
}

.settings-panel input[type="range"] {
  width: 100%;
  accent-color: var(--reader-accent);
}

.settings-panel__value {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
