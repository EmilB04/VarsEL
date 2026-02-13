<template>
  <section class="hero-section q-mb-xl text-center">
    <slot name="prepend" />

    <h1 class="text-h4 q-mb-md">{{ title }}</h1>
    <p v-if="description" class="text-subtitle1 text-grey-7 q-ma-none">{{ description }}</p>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
  }>(),
  {
    description: '',
  },
);
</script>
