<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="main-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
/* Clears the fixed bottom tab bar (see NavSection.vue) on mobile so page
   content and the footer aren't hidden behind it. */
@media (max-width: 868px) {
  .main-page-container {
    padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
