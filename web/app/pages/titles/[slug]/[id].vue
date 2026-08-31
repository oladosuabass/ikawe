<script setup lang="ts">
import type { MockTitle } from "~/types/title";

const route = useRoute();
const { fetchTitle, splitGenres, formatDuration, genrePath, titlePath } =
  useTitles();

const titleId = computed(() => String(route.params.id));
const showKeyIdeas = ref(false);

const {
  data: title,
  pending,
  error,
} = await useAsyncData(
  () => `title-${titleId.value}`,
  () => fetchTitle(titleId.value),
);

watch(
  () => title.value,
  (value) => {
    if (!value) return;
    const canonical = titlePath(value);
    if (route.path !== canonical) {
      navigateTo(canonical, { replace: true });
    }
  },
  { immediate: true },
);

useSeoMeta({
  title: () => title.value?.title || "Title",
  description: () => title.value?.description || "Ikawe summary",
});

const audiobookUrl = computed(() => {
  const book = title.value as MockTitle | null;
  if (book?.audiobook_url) return book.audiobook_url;
  if (!book?.title) return "";
  return `https://www.audible.com/search?keywords=${encodeURIComponent(book.title)}`;
});

function onPlayKeyIdeas() {
  showKeyIdeas.value = true;
  nextTick(() => {
    document.getElementById("key-ideas")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}
</script>

<template>
  <div class="page" :class="{ 'page--with-player': showKeyIdeas }">
    <NuxtLink to="/explore" class="back-link">← Back to explore</NuxtLink>

    <p v-if="pending" class="status">Loading title…</p>
    <p v-else-if="error" class="status status--error">Title not found.</p>

    <template v-else-if="title">
      <section class="hero">
        <div class="hero__cover">
          <img :src="title.cover_image_url" :alt="`${title.title} cover`" />
        </div>

        <div class="hero__meta">
          <h1>{{ title.title }}</h1>
          <p class="author">by {{ title.author }}</p>

          <p class="meta-line">
            <span v-if="title.pub_date">{{ title.pub_date }}</span>
            <span v-if="title.total_word_length">
              · {{ formatDuration(title.total_word_length) }}
            </span>
            <span v-if="title.rating"> · {{ title.rating }} rating</span>
          </p>

          <div v-if="splitGenres(title.genre).length" class="tags">
            <NuxtLink
              v-for="genre in splitGenres(title.genre)"
              :key="genre"
              :to="genrePath(genre)"
              class="tag">
              {{ genre }}
            </NuxtLink>
          </div>

          <div class="actions">
            <button
              type="button"
              class="action action--primary"
              @click="onPlayKeyIdeas">
              Play key ideas
            </button>
            <a
              v-if="audiobookUrl"
              class="action"
              :href="audiobookUrl"
              target="_blank"
              rel="noopener noreferrer">
              Listen to audiobook
            </a>
            <a
              v-if="title.file_url"
              class="action"
              :href="title.file_url"
              target="_blank"
              rel="noopener noreferrer"
              download>
              Download ebook
            </a>
          </div>
        </div>
      </section>

      <section v-if="title.description" class="summary">
        <p>{{ title.description }}</p>
      </section>

      <section
        v-if="showKeyIdeas && title.chapters.length"
        id="key-ideas"
        class="chapters">
        <h2>Key ideas</h2>
        <article
          v-for="(chapter, index) in title.chapters"
          :key="`${chapter.title}-${index}`"
          class="chapter">
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.content }}</p>
        </article>
      </section>

      <p
        v-else-if="showKeyIdeas && !title.chapters.length"
        id="key-ideas"
        class="status">
        Key ideas for this title are coming soon.
      </p>

      <AudioPlayer
        v-if="showKeyIdeas"
        sticky
        :src="(title as MockTitle).summary_audio_url"
        :title="title.title" />
    </template>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2rem;
  max-width: 760px;
}

.page--with-player {
  padding-bottom: 6.5rem;
}

.back-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
}

.hero {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.hero__cover {
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 0.35rem;
  background: var(--surface-muted);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.1);
}

.hero__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__meta h1 {
  margin: 0;
  font-family: Georgia, "Times New Roman", Times, serif;
  font-size: clamp(1.85rem, 3vw, 2.35rem);
  line-height: 1.15;
  font-weight: 700;
}

.author {
  margin: 0.6rem 0 0;
  color: var(--muted);
  font-size: 1rem;
}

.meta-line {
  margin: 0.75rem 0 0;
  color: var(--text-soft);
  font-size: 0.92rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 1rem;
}

.tags .tag {
  text-decoration: none;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.35rem;
}

.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.62rem 1rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: white;
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
}

.action:hover {
  border-color: var(--text);
}

.action--primary {
  background: var(--text);
  border-color: var(--text);
  color: white;
}

.summary p {
  margin: 0;
  color: var(--text-soft);
  font-size: 1.05rem;
  line-height: 1.75;
}

.chapters h2 {
  margin: 0 0 1rem;
  font-family: Georgia, "Times New Roman", Times, serif;
  font-size: 1.35rem;
  font-weight: 700;
}

.chapter {
  padding: 1.1rem 0;
  border-top: 1px solid var(--border);
}

.chapter h3 {
  margin: 0 0 0.45rem;
  font-size: 1rem;
  font-weight: 650;
}

.chapter p {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
}

.status {
  color: var(--muted);
}

.status--error {
  color: #b91c1c;
}

@media (max-width: 720px) {
  .hero {
    grid-template-columns: 120px 1fr;
    gap: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .action {
    width: 100%;
  }
}
</style>
