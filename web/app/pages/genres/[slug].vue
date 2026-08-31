<script setup lang="ts">
const route = useRoute();
const genreSlug = computed(() => String(route.params.slug));

const { fetchTitles, findGenreBySlug, filterByGenreSlug } = useTitles();

const {
  data: allTitles,
  pending,
  error,
} = await useAsyncData("all-titles-for-genres", () => fetchTitles());

const genreName = computed(() =>
  findGenreBySlug(allTitles.value || [], genreSlug.value),
);

const titles = computed(() =>
  filterByGenreSlug(allTitles.value || [], genreSlug.value),
);

useSeoMeta({
  title: () => genreName.value || "Genre",
  description: () =>
    genreName.value
      ? `Browse ${genreName.value} book summaries on Ikawe.`
      : "Browse book summaries by genre.",
});

watch(
  () => [pending.value, genreName.value] as const,
  ([isPending, name]) => {
    if (!isPending && !name) {
      throw createError({ statusCode: 404, statusMessage: "Genre not found" });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="page">
    <NuxtLink to="/explore" class="back-link">← Back to explore</NuxtLink>

    <p v-if="pending" class="status">Loading genre…</p>
    <p v-else-if="error" class="status status--error">Could not load titles.</p>

    <template v-else-if="genreName">
      <section class="hero">
        <p class="eyebrow">Genre</p>
        <h1>{{ genreName }}</h1>
        <p class="hero__copy">
          {{ titles.length }} summary{{ titles.length === 1 ? "" : "ies" }} in
          this category.
        </p>
      </section>

      <div v-if="titles.length" class="grid">
        <TitleCard v-for="title in titles" :key="title.id" :title="title" />
      </div>

      <p v-else class="status">No titles in this genre yet.</p>
    </template>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 1.5rem;
}

.back-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
}

.hero {
  display: grid;
  gap: 0.5rem;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}

.hero__copy {
  margin: 0;
  color: var(--text-soft);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.725rem;
}

.status {
  color: var(--muted);
}

.status--error {
  color: #b91c1c;
}
</style>
