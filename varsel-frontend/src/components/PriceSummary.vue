<template>
  <section class="price-summary" :aria-label="t('priceSummary.heading')">
    <button
      v-for="stat in stats"
      :key="stat.key"
      type="button"
      class="price-stat"
      :data-stat="stat.key"
      :aria-pressed="selectedKey === stat.key"
      @click="toggle(stat.key)"
    >
      <span class="stat-label">
        <q-icon :name="stat.icon" class="stat-icon" size="16px" aria-hidden="true" />
        {{ stat.label }}
      </span>
      <span class="stat-reading">
        <strong>{{ number.format(stat.value) }}</strong>
        <span class="stat-unit">{{ t('common.priceUnit') }}</span>
      </span>
      <span v-if="stat.detail" class="stat-detail">{{ stat.detail }}</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  getAvgPrice,
  getCurrentPriceIndex,
  getMaxPrice,
  getMaxPriceTime,
  getMinPrice,
  getMinPriceTime,
  getPriceDifference,
  type Price,
} from 'src/scripts/TableScript';
import type { HighlightKey } from 'src/scripts/ChartScript';
import { useOsloClock } from 'src/scripts/useOsloClock';

const props = defineProps<{ prices: Price[] }>();
const emit = defineEmits<{ highlight: [key: HighlightKey | null] }>();
const { t, locale } = useI18n();
const number = computed(
  () =>
    new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
);
const selectedKey = ref<HighlightKey | null>(null);
const now = useOsloClock();
const currentPrice = computed(() => props.prices[getCurrentPriceIndex(props.prices, now.value)]);
const stats = computed(() => {
  const prices = props.prices;
  const items: {
    key: HighlightKey;
    icon: string;
    label: string;
    value: number;
    detail?: string;
  }[] = [
    {
      key: 'lowest',
      icon: 'sym_o_arrow_downward',
      label: t('priceSummary.lowest'),
      value: getMinPrice(prices),
      detail: getMinPriceTime(prices),
    },
    {
      key: 'highest',
      icon: 'sym_o_arrow_upward',
      label: t('priceSummary.highest'),
      value: getMaxPrice(prices),
      detail: getMaxPriceTime(prices),
    },
    {
      key: 'average',
      icon: 'sym_o_monitoring',
      label: t('priceSummary.average'),
      value: getAvgPrice(prices),
    },
    {
      key: 'difference',
      icon: 'sym_o_compare_arrows',
      label: t('priceSummary.difference'),
      value: getPriceDifference(prices),
    },
  ];
  if (currentPrice.value) {
    items.unshift({
      key: 'current',
      icon: 'sym_o_schedule',
      label: t('priceSummary.current'),
      value: currentPrice.value.NOK_per_kWh,
      detail: currentPrice.value.time_start.slice(11, 16),
    });
  }
  return items;
});

function toggle(key: HighlightKey) {
  selectedKey.value = selectedKey.value === key ? null : key;
  emit('highlight', selectedKey.value);
}
watch(
  () => [props.prices[0]?.area, props.prices[0]?.date],
  (next, previous) => {
    if (next[0] === previous[0] && next[1] === previous[1]) return;
    selectedKey.value = null;
    emit('highlight', null);
  },
);
</script>

<style scoped>
.price-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
  gap: 10px;
}
.price-stat {
  display: grid;
  align-content: start;
  gap: 8px;
  min-width: 0;
  padding: 12px clamp(10px, 1.5vw, 16px);
  text-align: left;
  color: inherit;
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: 17px;
  box-shadow: var(--panel-shadow);
  font: inherit;
  --stat-ink: var(--q-primary);
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}
.price-stat[data-stat='lowest'] {
  --stat-ink: var(--positive-ink);
}
.price-stat[data-stat='highest'] {
  --stat-ink: var(--danger-ink);
}
.price-stat[data-stat='average'] {
  --stat-ink: var(--warning-ink);
}
.price-stat:hover,
.price-stat[aria-pressed='true'] {
  border-color: var(--q-primary);
  background: var(--accent-soft);
}
.stat-label {
  display: flex;
  min-height: 27px;
  align-items: center;
  gap: 6px;
  color: var(--text-subtle);
  font-size: 0.8rem;
  font-weight: 650;
}
.stat-icon {
  display: inline-grid;
  place-items: center;
  flex: 0 0 26px;
  height: 26px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--stat-ink) 10%, var(--surface-card));
  color: var(--stat-ink);
}
.stat-reading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 6px;
}
.price-stat strong {
  font: 500 clamp(1.25rem, 2.5vw, 1.85rem) / 1.05 var(--data-font);
  letter-spacing: -0.065em;
}
.stat-unit,
.stat-detail {
  color: var(--text-subtle);
  font-size: 0.72rem;
}
.stat-detail {
  font-family: var(--data-font);
  font-weight: 500;
}
@media (max-width: 600px) {
  .price-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
