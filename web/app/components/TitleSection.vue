<script setup lang="ts">
import type { MockTitle } from "~/types/title";

defineProps<{
  genre: string;
  titles: MockTitle[];
}>();

const { genrePath } = useTitles();
</script>

<template>
  <section class="title-section">
    <div class="title-section__header">
      <div>
        <p class="label">Genre</p>
        <h2>{{ genre }}</h2>
      </div>
      <NuxtLink :to="genrePath(genre)" class="view-all">View all</NuxtLink>
    </div>

    <div class="title-section__grid">
      <TitleCard v-for="title in titles" :key="title.id" :title="title" />
    </div>
  </section>
</template>

<style scoped>
.title-section {
  display: grid;
  gap: 1rem;
}

.title-section__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.label {
  margin: 0;
  color: var(--muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.title-section__header h2 {
  margin: 0.2rem 0 0;
  font-size: 1.35rem;
}

.view-all {
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}

.title-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.725rem;
}

@media (max-width: 720px) {
  .title-section__grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
