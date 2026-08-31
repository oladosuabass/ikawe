<script setup lang="ts">
const emit = defineEmits<{
  upload: [file: File];
}>();

const props = defineProps<{
  busy?: boolean;
  error?: string | null;
}>();

const dragging = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

function handleFiles(files: FileList | null) {
  const file = files?.[0];
  if (!file || props.busy) return;
  emit("upload", file);
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  handleFiles(event.dataTransfer?.files ?? null);
}

function openPicker() {
  inputRef.value?.click();
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--active': dragging, 'dropzone--busy': busy }"
    @dragenter.prevent="dragging = true"
    @dragover.prevent
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop">
    <input
      ref="inputRef"
      type="file"
      accept=".txt,.md,.pdf,.epub,.docx,.doc,.html,.htm,.rtf,.odt,.mobi,.fb2,.cbz,.xps"
      class="dropzone__input"
      @change="handleFiles(($event.target as HTMLInputElement).files)" />

    <div class="dropzone__icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 16V4m0 0 7 7m-7-7L5 11"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round" />
        <path
          d="M4 20h16"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round" />
      </svg>
    </div>

    <p class="dropzone__title">
      {{ busy ? "Adding to your shelf…" : "Drop a book here" }}
    </p>
    <p class="dropzone__hint">
      PDF, EPUB, DOCX, TXT, and other supported book formats
    </p>

    <button
      type="button"
      class="dropzone__button"
      :disabled="busy"
      @click="openPicker">
      Choose file
    </button>

    <p v-if="error" class="dropzone__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.dropzone {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  padding: 2rem 1.5rem;
  border: 1.5px dashed var(--border);
  border-radius: calc(var(--radius) + 0.25rem);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.55), transparent),
    var(--surface);
  text-align: center;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.dropzone--active {
  border-color: var(--accent-soft);
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  transform: translateY(-1px);
}

.dropzone--busy {
  opacity: 0.72;
  pointer-events: none;
}

.dropzone__input {
  display: none;
}

.dropzone__icon {
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--accent);
}

.dropzone__title {
  margin: 0.35rem 0 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.dropzone__hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.dropzone__button {
  margin-top: 0.35rem;
  padding: 0.65rem 1.1rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-elevated);
  color: var(--text);
  cursor: pointer;
  box-shadow: var(--shadow);
}

.dropzone__button:disabled {
  cursor: not-allowed;
}

.dropzone__error {
  margin: 0.35rem 0 0;
  color: #9f3b2f;
  font-size: 0.88rem;
}
</style>
