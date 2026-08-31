<template>
  <div class="landing">
    <section class="landing__hero">
      <p class="landing__eyebrow">E-ink inspired reading</p>
      <h1>Paper-feel reading for your books.</h1>
      <p class="landing__lede">
        Upload and read your books in a calm reader — warm paper tones, serif
        typography, and page turns that feel closer to Kindle, Kobo, or Xteink.
      </p>
      <p class="landing__lede">
        Supports PDF, EPUB, TXT, MOBI, and more. No signup, no ads, no tracking.
        Just your books, stored locally in your browser.
      </p>
      <NuxtLink to="/library" class="landing__cta">Open your library</NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.landing {
  display: grid;
  place-items: center;
  min-height: calc(100dvh - 8rem);
}

.landing__hero {
  display: grid;
  gap: 0.85rem;
  max-width: 42rem;
}

.landing__eyebrow {
  margin: 0;
  color: var(--accent-soft);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.landing__hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.08;
  font-weight: 600;
}

.landing__lede {
  margin: 0;
  color: var(--text-soft);
  font-size: 1.02rem;
  line-height: 1.7;
}

.landing__cta {
  justify-self: start;
  margin-top: 0.5rem;
  padding: 0.75rem 1.15rem;
  border-radius: 999px;
  background: var(--accent);
  color: #faf8f3;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: var(--shadow);
}

.landing__cta:hover {
  filter: brightness(1.05);
}
</style>
