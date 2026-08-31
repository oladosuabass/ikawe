<template>
  <header class="app-header">
    <div class="app-header__inner">
      <NuxtLink to="/" class="app-header__brand">
        <img
          src="/ikawe-logo.png"
          alt="Ikawe"
          class="app-header__logo"
          width="132"
          height="40" />
        <small class="app-header__tagline">E-ink reader</small>
      </NuxtLink>

      <nav class="app-header__nav" aria-label="Main">
        <NuxtLink to="/library">Library</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(10px);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1080px;
  margin: 0 auto;
  padding: 1rem 1.25rem;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text);
  text-decoration: none;
}

.app-header__tagline {
  color: var(--muted);
  font-size: 0.78rem;
}

.app-header__logo {
  display: block;
  height: 2.25rem;
  width: auto;
  border-radius: 0.35rem;
}

.app-header__nav a {
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
}

.app-header__nav a.router-link-active {
  color: var(--text);
}
</style>
