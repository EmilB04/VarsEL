<template>
  <q-page class="app-page">
    <main class="missing-page">
      <HeroSection title="404" :description="t('errorNotFound.title')" />
      <q-btn
        color="primary"
        unelevated
        to="/"
        :label="t('errorNotFound.goHome')"
        icon="sym_o_arrow_back"
        no-caps
      />
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import HeroSection from 'src/components/HeroSection.vue';

const { t } = useI18n();
</script>

<style scoped>
.missing-page {
  padding: clamp(18px, 4vw, 42px);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface-card);
  box-shadow: var(--panel-shadow);
}
.missing-page :deep(h1) {
  width: max-content;
  padding: 8px 13px;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--q-primary);
  font: 500 clamp(2rem, 5vw, 3rem) / 1.06 var(--data-font);
}
</style>
