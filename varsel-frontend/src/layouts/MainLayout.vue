<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="main-page-container">
      <router-view />
    </q-page-container>

    <!-- Rendered once for the whole app so the cold-start notice is visible
         without scrolling on every page. -->
    <BackendStatusBar />
  </q-layout>
</template>

<script setup lang="ts">
import BackendStatusBar from 'src/components/BackendStatusBar.vue';
</script>

<style scoped>
/* Clears the fixed bottom tab bar (see NavSection.vue) on mobile so page
   content and the footer aren't hidden behind it. */
@media (max-width: 868px) {
  .main-page-container {
    padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
