<template>
  <section class="hero-section">
    <slot name="prepend" />
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
