<script setup lang="ts">
defineProps<{
  title: string;
  updated: string;
}>();
</script>

<template>
  <article class="legal">
    <header class="legal__header">
      <p class="legal__eyebrow">Legal</p>
      <h1>{{ title }}</h1>
      <p class="legal__updated">Last updated: {{ updated }}</p>
    </header>
    <div class="legal__body">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.legal {
  display: grid;
  gap: 1.75rem;
  max-width: 42rem;
}

.legal__header {
  display: grid;
  gap: 0.45rem;
}

.legal__eyebrow {
  margin: 0;
  color: var(--accent-soft);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.legal__header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  line-height: 1.12;
}

.legal__updated {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.legal__body :deep(h2) {
  margin: 1.75rem 0 0.65rem;
  font-size: 1.05rem;
  line-height: 1.35;
}

.legal__body :deep(h2:first-child) {
  margin-top: 0;
}

.legal__body :deep(p),
.legal__body :deep(li) {
  color: var(--text-soft);
  line-height: 1.7;
}

.legal__body :deep(p) {
  margin: 0 0 0.85rem;
}

.legal__body :deep(ul) {
  margin: 0 0 0.85rem;
  padding-left: 1.2rem;
}

.legal__body :deep(a) {
  color: var(--accent);
}
</style>
