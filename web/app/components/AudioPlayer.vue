<script setup lang="ts">
const props = defineProps<{
  src?: string;
  title?: string;
  sticky?: boolean;
}>();

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

function togglePlay() {
  const audio = audioRef.value;
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    isPlaying.value = true;
  } else {
    audio.pause();
    isPlaying.value = false;
  }
}

function onTimeUpdate() {
  currentTime.value = audioRef.value?.currentTime || 0;
}

function onLoadedMetadata() {
  duration.value = audioRef.value?.duration || 0;
}

function onEnded() {
  isPlaying.value = false;
}

function seek(event: Event) {
  const audio = audioRef.value;
  const value = Number((event.target as HTMLInputElement).value);
  if (!audio) return;
  audio.currentTime = value;
  currentTime.value = value;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
</script>

<template>
  <section
    class="audio-player"
    :class="{ 'audio-player--sticky': sticky }"
    role="region"
    :aria-label="title ? `Audio player for ${title}` : 'Audio player'">
    <div v-if="sticky" class="audio-player__sticky-inner">
      <div class="audio-player__meta">
        <p class="audio-player__label">Key ideas</p>
        <p v-if="title" class="audio-player__title">{{ title }}</p>
      </div>

      <div v-if="src" class="audio-player__controls">
        <button type="button" class="play-btn" @click="togglePlay">
          {{ isPlaying ? "Pause" : "Play" }}
        </button>
        <div class="timeline">
          <span>{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="duration || 0"
            step="0.1"
            :value="currentTime"
            @input="seek" />
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
      <p v-else class="placeholder-note">Audio unavailable.</p>

      <audio
        ref="audioRef"
        :src="src"
        preload="metadata"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded" />
    </div>

    <template v-else>
      <div class="audio-player__header">
        <p class="audio-player__label">Listen to summary</p>
        <p v-if="title" class="audio-player__title">{{ title }}</p>
      </div>

      <div v-if="src" class="audio-player__controls">
        <button type="button" class="play-btn" @click="togglePlay">
          {{ isPlaying ? "Pause" : "Play" }}
        </button>
        <div class="timeline">
          <span>{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="duration || 0"
            step="0.1"
            :value="currentTime"
            @input="seek" />
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
      <p v-else class="placeholder-note">
        Summary audio will appear here once generated.
      </p>

      <audio
        ref="audioRef"
        :src="src"
        preload="metadata"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded" />
    </template>
  </section>
</template>

<style scoped>
.audio-player {
  padding: 1rem 1.125rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: var(--surface-elevated);
}

.audio-player--sticky {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  padding: 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
  box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.08);
}

.audio-player__sticky-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.875rem 1.25rem;
  display: grid;
  grid-template-columns: minmax(0, 220px) 1fr;
  gap: 1rem;
  align-items: center;
}

.audio-player__label {
  margin: 0;
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.audio-player__title {
  margin: 0.15rem 0 0;
  font-weight: 600;
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-player__controls {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.875rem;
  align-items: center;
}

.play-btn {
  padding: 0.55rem 1rem;
  border: 1px solid var(--text);
  border-radius: 999px;
  background: var(--text);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.timeline {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  color: var(--muted);
  font-size: 0.82rem;
}

.timeline input {
  width: 100%;
}

.placeholder-note {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}

@media (max-width: 720px) {
  .audio-player__sticky-inner {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .audio-player__controls {
    grid-template-columns: 1fr;
  }
}
</style>
