<script setup lang="ts">
import type { LibraryBook } from "~/types/library";

const props = defineProps<{
  book: LibraryBook;
  progressPercent?: number;
}>();

const emit = defineEmits<{
  remove: [id: string];
}>();

const { getCover } = useLibrary();
const coverUrl = ref<string | null>(null);

const progressLabel = computed(() => {
  if (!props.progressPercent) return "Not started";
  if (props.progressPercent >= 99) return "Finished";
  return `${props.progressPercent}% read`;
});

onMounted(async () => {
  if (props.book.hasCover) {
    coverUrl.value = await getCover(props.book.id);
  }
});
</script>

<template>
  <article class="book-card">
    <NuxtLink :to="`/read/${book.id}`" class="book-card__link">
      <div class="book-card__cover" :style="{ '--spine': book.coverColor }">
        <img
          v-if="coverUrl"
          class="book-card__cover-image"
          :src="coverUrl"
          :alt="`${book.title} cover`"
          loading="lazy" />
        <div class="book-card__cover-text">
          <span class="book-card__format">{{ book.format }}</span>
          <h3>{{ book.title }}</h3>
          <p>{{ book.author }}</p>
        </div>
      </div>

      <div class="book-card__meta">
        <span>{{ progressLabel }}</span>
        <span>{{ book.wordCount.toLocaleString() }} words</span>
      </div>

      <div class="book-card__progress" aria-hidden="true">
        <span :style="{ width: `${Math.max(progressPercent ?? 0, 4)}%` }" />
      </div>
    </NuxtLink>

    <button
      type="button"
      class="book-card__remove"
      aria-label="Remove from library"
      @click.stop="emit('remove', book.id)">
      ×
    </button>
  </article>
</template>

<style scoped>
.book-card {
  position: relative;
}

.book-card__link {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-elevated);
  color: inherit;
  text-decoration: none;
  box-shadow: var(--shadow);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.book-card__link:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px rgba(31, 28, 24, 0.12);
}

.book-card__cover {
  position: relative;
  min-height: 10.5rem;
  overflow: hidden;
  border-radius: 0.75rem;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--spine) 88%, black) 0 8px,
      transparent 8px
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--spine) 18%, white),
      color-mix(in srgb, var(--spine) 8%, white)
    );
  border: 1px solid color-mix(in srgb, var(--spine) 24%, var(--border));
}

.book-card__cover-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-card__cover-text {
  position: relative;
  z-index: 1;
  min-height: 10.5rem;
  padding: 1rem 1rem 1rem 1.35rem;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.92) 38%,
    rgba(255, 255, 255, 0.96)
  );
}

.book-card__format {
  display: inline-flex;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  color: var(--text-soft);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.book-card__cover-text h3 {
  margin: 0.75rem 0 0.35rem;
  font-size: 1.05rem;
  line-height: 1.25;
}

.book-card__cover-text p {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.88rem;
}

.book-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.82rem;
}

.book-card__progress {
  height: 4px;
  border-radius: 999px;
  background: var(--surface-muted);
  overflow: hidden;
}

.book-card__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.book-card__remove {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.book-card:hover .book-card__remove,
.book-card__remove:focus-visible {
  opacity: 1;
}
</style>
