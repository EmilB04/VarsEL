<template>
  <q-layout view="lHh Lpr lFf" class="app-shell">
    <NavSection />

    <q-page-container class="main-page-container">
      <router-view />
      <FooterSection />
    </q-page-container>

    <BackendStatusBar />
  </q-layout>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import BackendStatusBar from 'src/components/BackendStatusBar.vue';
import FooterSection from 'src/components/FooterSection.vue';
import NavSection from 'src/components/NavSection.vue';

const route = useRoute();
const { t } = useI18n();
watchEffect(() => {
  const title = route.meta.title;
  document.title = typeof title === 'string' ? `${t(title)} · VarsEL` : 'VarsEL';
});
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
}
.main-page-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.main-page-container :deep(.app-page) {
  width: 100%;
  flex: 1;
}
@media (max-width: 868px) {
  .main-page-container {
    padding-bottom: calc(var(--dock-height) + var(--dock-gap) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
