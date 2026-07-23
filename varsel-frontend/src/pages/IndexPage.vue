<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <HeroSection
        :title="t('index.heroTitle')"
        :description="t('index.heroDescription')"
        class="q-py-xl"
      />

      <div class="selector-container glass-card q-pa-lg q-mb-xl">
        <div class="row q-gutter-md">
          <q-select
            v-model="selectedArea"
            :options="areaOptions"
            :label="t('index.selectArea')"
            class="col-12 col-md"
            emit-value
            map-options
            @update:model-value="fetchTodaysPrices"
            filled
          >
            <template v-slot:prepend>
              <q-icon name="location_on" />
            </template>
          </q-select>

          <q-select
            v-model="selectedCity"
            :options="filteredCityOptions"
            :label="t('index.selectCity')"
            class="col-12 col-md"
            emit-value
            map-options
            :disable="!selectedArea"
            @update:model-value="fetchTodaysPrices"
            filled
          >
            <template v-slot:prepend>
              <q-icon name="apartment" />
            </template>
          </q-select>
        </div>
      </div>

      <div v-if="prices.length" class="q-mt-lg">
        <h2 class="text-h5 q-mb-lg">
          <q-icon name="trending_up" size="sm" class="q-mr-sm" />
          {{ t('index.chartHeading', { city: getDisplayCity() }) }}
        </h2>

        <div class="chart-container q-mb-xl">
          <canvas ref="localCanvasRef" style="display: block; width: 100%; height: 100%"></canvas>
        </div>

        <PriceSummary :prices="prices" @highlight="setHighlight" />
      </div>

      <PriceLoadingSkeleton v-if="isLoading" />

      <q-banner v-if="loadingTakingLong" class="glass-card q-mt-lg q-pa-lg" type="info" rounded>
        <template v-slot:avatar>
          <q-icon name="info" color="info" size="lg" />
        </template>
        <div class="text-body1"><strong>{{ t('common.loadingTakingLongTitle') }}</strong></div>
        <div class="text-body2 q-mt-sm">
          <i18n-t keypath="common.loadingTakingLongDescription" tag="span" scope="global">
            <template #countdown><strong>{{ formatCountdown(loadingCountdownSeconds) }}</strong></template>
          </i18n-t>
        </div>
      </q-banner>

      <q-banner v-if="hasError" class="error-banner glass-card q-mt-lg q-pa-lg" rounded>
        <template v-slot:avatar>
          <q-icon name="warning" color="warning" size="lg" />
        </template>
        <div class="text-body1 q-mb-sm"><strong>{{ t('common.errorTitle') }}</strong></div>
        <div class="text-body2 q-mb-md">
          {{ t('common.errorDescription') }}
        </div>
        <a href="https://varsel-hari.onrender.com/api/prices/" target="_blank" class="text-primary">
          https://varsel-hari.onrender.com/api/prices/
        </a>
        <div class="q-mt-md">
          <q-btn :label="t('common.retry')" color="primary" @click="fetchTodaysPrices" unelevated rounded />
        </div>
      </q-banner>

      <q-table
        class="table q-mt-xl"
        v-if="prices.length"
        :rows="prices"
        :columns="simplifiedColumns"
        row-key="time_start"
        flat
        :pagination="{ rowsPerPage: 12 }"
      >
        <template v-slot:top>
          <div class="text-h6">
            <q-icon name="table_chart" class="q-mr-sm" />
            {{ t('index.tableHeading') }}
          </div>
        </template>
      </q-table>
    </main>
  </q-page>
  <footer class="text-center q-mt-xl q-pb-lg">
    <FooterSection />
  </footer>
</template>

<style lang="scss" scoped>

:deep(.hero-section) {
  text-align: center;
}

.chart-container {
  position: relative;
  height: 450px;
  width: 100%;
}

// Action Cards
.action-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  }

  .q-icon {
    transition: transform 0.3s ease;
  }

  &:hover .q-icon {
    transform: scale(1.1);
  }
}

// Error States
.error-banner {
  a {
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}

.table {
  border-radius: 16px;
  overflow: hidden;

  :deep(thead tr th) {
    background: rgba(255, 255, 255, 0.1);
    font-weight: 700;
    font-size: 0.875rem;
  }

  :deep(tbody tr:hover) {
    background: color-mix(in srgb, var(--q-primary) 5%, transparent);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  :deep(.hero-section) {
    // padding already handled by q-py-md class

    .text-h4 {
      font-size: 1.75rem;
    }
  }

  .chart-container {
    height: 300px;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'boot/axios';
import FooterSection from 'src/components/FooterSection.vue';
import HeroSection from 'src/components/HeroSection.vue';
import NavSection from 'src/components/NavSection.vue';
import PriceSummary from 'src/components/PriceSummary.vue';
import PriceLoadingSkeleton from 'src/components/PriceLoadingSkeleton.vue';
import { useTableServices, type Price, baseCities } from 'src/scripts/TableScript';
import { useChartServices } from 'src/scripts/ChartScript';
import { useBackendRequest, formatCountdown } from 'src/scripts/useBackendRequest';
import { useTaxMode } from 'src/composables/useTaxMode';

const { t } = useI18n();
const { isTaxIncluded } = useTaxMode();

// Reactive state variables - simplified for today only
const selectedArea = ref('NO1');
const selectedCity = ref<string | null>(null);
// Prices as returned by the backend, tax-excluded - the tax multiplier is applied
// reactively in `prices` below, so toggling "Incl./Excl. VAT" updates instantly.
const rawPrices = ref<Price[]>([]);
const prices = computed<Price[]>(() =>
  rawPrices.value.map((price) => ({
    ...price,
    NOK_per_kWh: isTaxIncluded.value ? price.NOK_per_kWh * 1.25 : price.NOK_per_kWh,
  })),
);

const {
  isLoading,
  hasError,
  loadingTakingLong,
  loadingCountdownSeconds,
  run,
} = useBackendRequest();

// Use table services
const {
  areaOptions,
  filteredCityOptions,
} = useTableServices(selectedArea);

// Simplified columns for today's view
const simplifiedColumns = computed(() => [
  { name: 'time_start', required: true, label: t('common.tableColumns.time'), align: 'left' as const, field: 'time_start', sortable: true,
    format: (val: string) => val ? val.slice(11, 16) : '' },
  { name: 'NOK_per_kWh', required: true, label: t('common.tableColumns.price'), align: 'right' as const, field: 'NOK_per_kWh', sortable: true,
    format: (val: number) => val.toFixed(3) },
]);

// Use chart services
const { chartCanvas, createChart, setHighlight } = useChartServices();
const localCanvasRef = ref<HTMLCanvasElement | null>(null);

async function fetchTodaysPrices() {
  await run(async () => {
    // Always use today's date
    const today = new Date().toISOString().slice(0, 10);

    // Use city if chosen, else use area
    const regionParam = selectedCity.value || selectedArea.value;
    const url = `/prices/${regionParam}/${today}`;

    // Get all hours for today (0-24)
    const params = {
      startHour: 0,
      endHour: 24,
    };

    // Send GET-call to backend
    const response = await api.get(url, { params });

    // If response is string (from Java), parse it
    const json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    // Validate that the backend returned a prices array
    if (!json || !Array.isArray(json.prices) || json.prices.length === 0) {
      console.warn('API returned no price data or invalid format', json);
      hasError.value = true;
      rawPrices.value = [];
      return;
    }

    // Enrich each object with area, city, and today's date (tax-excluded -
    // `prices` applies the multiplier reactively based on the current setting)
    rawPrices.value = json.prices.map((price: Price) => ({
      ...price,
      area: selectedArea.value,
      city: selectedCity.value || baseCities[selectedArea.value as keyof typeof baseCities],
      date: today,
    }));

    // Ensure DOM is updated and canvas ref is available
    await nextTick();
    renderChart();
  });
}

// (Re)draws the chart from the current `prices` (tax-adjusted) - used both after
// a fetch and whenever the tax-inclusion setting changes on already-loaded data.
function renderChart() {
  const canvasToUse = localCanvasRef.value ?? chartCanvas.value;
  if (!canvasToUse) {
    console.error('Chart creation failed - canvas or data missing');
    return;
  }
  createChart(canvasToUse, prices.value);
}

watch(isTaxIncluded, async () => {
  if (!rawPrices.value.length) return;
  await nextTick();
  renderChart();
});

onMounted(() => {
  // Fetch today's prices on initial load
  void fetchTodaysPrices();
});

// Function to get the display city name
function getDisplayCity(): string {
  if (selectedCity.value) {
    // Find the selected city in cityOptions to get its label
    const cityOption = filteredCityOptions.value.find((city) => city.value === selectedCity.value);
    return cityOption ? cityOption.label : selectedCity.value;
  } else {
    // Return the default city for the selected area
    return baseCities[selectedArea.value as keyof typeof baseCities];
  }
}
</script>
