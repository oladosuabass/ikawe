<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <p class="app-footer__copy">© {{ year }} Ikawe</p>
      <nav class="app-footer__nav" aria-label="Legal">
        <NuxtLink to="/terms">Terms of Use</NuxtLink>
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.app-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 2rem;
}

.app-footer__copy {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.app-footer__nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-footer__nav a {
  color: var(--muted);
  font-size: 0.85rem;
  text-decoration: none;
}

.app-footer__nav a:hover {
  color: var(--text);
}
</style>
