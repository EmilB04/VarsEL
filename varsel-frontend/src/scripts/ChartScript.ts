import { onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccent } from 'src/composables/useAccent';
import { useTheme } from 'src/composables/useTheme';
import type { Chart } from 'chart.js';
import { getCurrentPriceIndex, type Price } from './TableScript';
import { useOsloClock } from './useOsloClock';

export type HighlightKey = 'lowest' | 'highest' | 'current' | 'average' | 'difference';

export function useChartServices() {
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  const { t, locale } = useI18n();
  const { accent } = useAccent();
  const { currentTheme } = useTheme();
  const now = useOsloClock();
  let chart: Chart | null = null;
  let prices: Price[] = [];
  let highlight: HighlightKey | null = null;
  let renderId = 0;

  async function render() {
    const id = ++renderId;
    const canvas = chartCanvas.value;
    if (!canvas || !prices.length) return;
    try {
      // The price request and the page can start before Chart.js is loaded.
      const { drawPriceChart } = await import('./drawPriceChart');
      if (id !== renderId || chartCanvas.value !== canvas) return;
      chart?.destroy();
      chart = drawPriceChart(
        canvas,
        prices,
        highlight,
        getCurrentPriceIndex(prices, now.value),
        locale.value,
        {
          unit: t('common.priceUnit'),
          now: t('priceSummary.chartNow'),
          average: t('priceSummary.average'),
          difference: t('priceSummary.difference'),
        },
      );
    } catch (error) {
      console.error('Could not render the price chart', error);
    }
  }

  function createChart(canvas: HTMLCanvasElement | null, nextPrices: Price[]) {
    if (chartCanvas.value !== canvas) return;
    prices = nextPrices;
    void render();
  }

  function setHighlight(key: HighlightKey | null) {
    highlight = key;
    void render();
  }

  watch([accent, currentTheme, locale], render, { flush: 'post' });
  watch(() => getCurrentPriceIndex(prices, now.value), render);
  watch(chartCanvas, (current, previous) => {
    if (previous && current !== previous) {
      renderId++;
      chart?.destroy();
      chart = null;
      highlight = null;
    }
  });

  onUnmounted(() => {
    renderId++;
    chart?.destroy();
  });

  return { chartCanvas, createChart, setHighlight };
}
