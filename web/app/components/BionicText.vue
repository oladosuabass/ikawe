<script setup lang="ts">
import { tokenizeBionic } from "~/utils/bionicText";

const props = defineProps<{
  text: string;
  enabled?: boolean;
}>();

const parts = computed(() => tokenizeBionic(props.text));
</script>

<template>
  <template v-if="enabled">
    <template v-for="(part, index) in parts" :key="index">
      <span v-if="part.type === 'space'" class="bionic-space">{{
        part.value
      }}</span>
      <span v-else class="bionic-word">
        <strong>{{ part.bold }}</strong
        >{{ part.rest }}
      </span>
    </template>
  </template>
  <template v-else>{{ text }}</template>
</template>

<style scoped>
.bionic-word strong {
  font-weight: 700;
}
</style>
