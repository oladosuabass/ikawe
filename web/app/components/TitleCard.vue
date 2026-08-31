<script setup lang="ts">
import type { MockTitle } from "~/types/title";

defineProps<{
  title: MockTitle;
}>();

const { formatDuration, splitGenres, titlePath } = useTitles();
</script>

<template>
  <NuxtLink :to="titlePath(title)" class="title-card">
    <div class="title-card__cover">
      <img
        :src="title.cover_image_url"
        :alt="`${title.title} cover`"
        loading="lazy" />
      <span v-if="title.rating" class="title-card__rating">
        {{ title.rating.toFixed(1) }}
      </span>
    </div>

    <div class="title-card__body">
      <h2>{{ title.title }}</h2>
      <p class="title-card__author">{{ title.author }}</p>
      <p class="title-card__meta">
        {{ formatDuration(title.total_word_length) }}
        <span v-if="title.format"> · {{ title.format.toUpperCase() }}</span>
      </p>
      <div class="title-card__tags">
        <span
          v-for="genre in splitGenres(title.genre).slice(0, 2)"
          :key="genre"
          class="tag">
          {{ genre }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.title-card {
  display: flex;
  flex-direction: column;
  /* gap: 0.875rem;
  height: 100%;
  padding: 0.875rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: var(--surface-elevated);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease; */
}

.title-card:hover {
  /* transform: translateY(-2px); */
  /* border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); */
}

.title-card__cover {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--surface-muted);
}

.title-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-card__rating {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.title-card__body h2 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}

.title-card__author {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
  text-overflow: ellipsis;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}

.title-card__meta {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}

.title-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.65rem;
  text-overflow: ellipsis;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}

.tag {
  text-overflow: ellipsis;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}
</style>
