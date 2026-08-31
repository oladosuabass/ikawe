<script setup lang="ts">
import type { TitleChapter } from "~/types/title";

defineProps<{
  description: string | null;
  chapters: TitleChapter[];
}>();
</script>

<template>
  <section class="summary-reader">
    <div class="summary-reader__intro">
      <p class="label">Summary</p>
      <p v-if="description" class="summary-reader__description">
        {{ description }}
      </p>
      <p v-else class="summary-reader__empty">No summary available yet.</p>
    </div>

    <div v-if="chapters.length" class="summary-reader__chapters">
      <h2>Chapters</h2>
      <article
        v-for="(chapter, index) in chapters"
        :key="`${chapter.title}-${index}`"
        class="chapter">
        <h3>{{ chapter.title }}</h3>
        <p>{{ chapter.content }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.summary-reader {
  display: grid;
  gap: 1.5rem;
}

.label {
  margin: 0;
  color: var(--muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-reader__description {
  margin: 0.5rem 0 0;
  line-height: 1.7;
  font-size: 1.02rem;
}

.summary-reader__empty {
  margin: 0.5rem 0 0;
  color: var(--muted);
}

.summary-reader__chapters h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.chapter {
  padding: 1rem 0;
  border-top: 1px solid var(--border);
}

.chapter h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.chapter p {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.65;
}
</style>
