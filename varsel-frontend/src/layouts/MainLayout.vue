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
/* Reserves space below every page's content (including its footer) so the
   fixed BackendStatusBar pill - which can appear/disappear at any scroll
   position - never lands on top of real footer content when the user is
   scrolled to the bottom of the page. The pill's own footprint is roughly
   4rem including its margins, so this comfortably clears it on desktop. */
.main-page-container {
  padding-bottom: 4.5rem;
}

/* On mobile the status pill shifts up to clear the bottom tab bar (see
   NavSection.vue / BackendStatusBar.vue), so both are stacked above the
   viewport's bottom edge at once - the reserved space has to clear that
   whole stack, not just the tab bar. */
@media (max-width: 868px) {
  .main-page-container {
    padding-bottom: calc(56px + 4.5rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
