<script setup lang="ts">
import { buildReaderSegments, type TocAnchor } from "~/utils/readerContent";

const props = defineProps<{
  content: string;
  bionic?: boolean;
  greyscaleImages?: boolean;
  tocAnchors?: TocAnchor[];
}>();

const segments = computed(() =>
  buildReaderSegments(props.content, props.tocAnchors ?? []),
);
</script>

<template>
  <div
    class="reader-content"
    :class="{ 'reader-content--grey-images': greyscaleImages }">
    <div
      v-for="(block, index) in segments"
      :key="`${block.type}-${index}`"
      class="reader-content__block">
      <span
        v-if="block.type === 'anchor'"
        :id="block.id"
        class="reader-content__anchor"
        aria-hidden="true" />
      <p v-else-if="block.type === 'text'" class="reader-content__text">
        <BionicText :text="block.value" :enabled="bionic" />
      </p>
      <figure v-else class="reader-content__figure">
        <img
          :src="block.src"
          alt="Illustration"
          loading="lazy"
          decoding="async" />
      </figure>
    </div>
  </div>
</template>

<style scoped>
.reader-content__block {
  display: contents;
}
.reader-content__anchor {
  display: block;
  height: 0;
  overflow: hidden;
  scroll-margin-top: 5.5rem;
}

.reader-content__text {
  margin: 0 0 1.2em;
  white-space: pre-wrap;
  text-align: justify;
  hyphens: auto;
  text-indent: 1.5em;
}

.reader-content__text:first-child {
  text-indent: 0;
}

.reader-content__figure {
  margin: 0 0 1.5em;
  text-indent: 0;
}

.reader-content__figure img {
  display: block;
  width: 100%;
  max-height: min(70vh, 36rem);
  object-fit: contain;
  border-radius: 0.35rem;
}

.reader-content--grey-images .reader-content__figure img {
  filter: grayscale(100%);
}
</style>
