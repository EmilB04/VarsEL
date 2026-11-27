<template>
  <div class="price-loading" role="status" :aria-label="t('common.loadingPrices')">
    <div class="chart-placeholder">
      <q-skeleton type="text" width="172px" height="32px" aria-hidden="true" />
      <q-skeleton class="plot-placeholder" aria-hidden="true" />
    </div>
    <div class="summary-placeholder" aria-hidden="true">
      <q-skeleton v-for="tile in 5" :key="tile" height="105px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.price-loading {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}
.chart-placeholder {
  display: grid;
  gap: 12px;
  padding: clamp(12px, 2.2vw, 24px);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface-card);
  box-shadow: var(--panel-shadow);
}
.price-loading :deep(.q-skeleton) {
  background: var(--surface-inset);
}
.plot-placeholder {
  height: clamp(245px, 30vw, 350px);
  border-radius: var(--control-radius);
}
.summary-placeholder {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
}
@media (max-width: 600px) {
  .summary-placeholder {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
