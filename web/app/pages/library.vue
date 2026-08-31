<script setup lang="ts">
const { books, addFile, removeBook } = useLibrary();
const { getProgress } = useReaderSettings();

const uploading = ref(false);
const uploadError = ref<string | null>(null);

async function handleUpload(file: File) {
  uploadError.value = null;
  uploading.value = true;

  try {
    const book = await addFile(file);
    await navigateTo(`/read/${book.id}`);
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : "Could not add this file.";
  } finally {
    uploading.value = false;
  }
}

function progressPercent(bookId: string) {
  const progress = getProgress(bookId);
  if (!progress) return 0;
  return Math.min(100, Math.max(0, progress.percent));
}
</script>

<template>
  <div class="library">
    <section class="library__hero">
      <p class="library__eyebrow">Private shelf · local only</p>
      <h1>Paper-feel reading for your books.</h1>
      <p class="library__lede">
        Upload and read your books in a calm, e-ink inspired reader — warm paper
        tones, serif typography, and page turns that feel closer to Kindle,
        Kobo, or Xteink.
      </p>

      <p class="library__lede">
        Supports PDF, EPUB, TXT, MOBI, and more. No signup, no ads, no tracking,
        no subscription. Just your books, your way.
      </p>
    </section>

    <UploadDropzone
      :busy="uploading"
      :error="uploadError"
      @upload="handleUpload" />

    <section class="library__shelf">
      <div class="library__shelf-head">
        <h2>Your shelf</h2>
        <span
          >{{ books.length }} {{ books.length === 1 ? "book" : "books" }}</span
        >
      </div>

      <div v-if="books.length" class="library__grid">
        <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          :progress-percent="progressPercent(book.id)"
          @remove="removeBook" />
      </div>

      <p v-else class="library__empty">Upload a .txt file to start reading.</p>
    </section>
  </div>
</template>

<style scoped>
.library {
  display: grid;
  gap: 1.75rem;
}

.library__hero {
  display: grid;
  gap: 0.75rem;
  max-width: 42rem;
}

.library__eyebrow {
  margin: 0;
  color: var(--accent-soft);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.library__hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.08;
  font-weight: 600;
}

.library__lede {
  margin: 0;
  color: var(--text-soft);
  font-size: 1.02rem;
  line-height: 1.7;
}

.library__shelf {
  display: grid;
  gap: 1rem;
}

.library__shelf-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.library__shelf-head h2 {
  margin: 0;
  font-size: 1.15rem;
}

.library__shelf-head span {
  color: var(--muted);
  font-size: 0.88rem;
}

.library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

.library__empty {
  margin: 0;
  padding: 2rem 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--muted);
  text-align: center;
}
</style>
