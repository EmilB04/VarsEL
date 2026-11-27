<template>
  <q-page class="app-page index-page">
    <main>
      <div class="today-intro">
        <HeroSection :title="t('index.heroTitle')" :description="displayDate" />
        <div v-if="currentPrice" class="today-current">
          <span class="current-label">
            <q-icon name="sym_o_bolt" size="16px" aria-hidden="true" />
            {{ t('priceSummary.current') }}
          </span>
          <div>
            <strong>{{ priceNumber.format(currentPrice.NOK_per_kWh) }}</strong>
            <small>{{ t('common.priceUnit') }}</small>
          </div>
          <time>{{ currentPrice.time_start.slice(11, 16) }}–{{ currentPrice.time_end.slice(11, 16) }}</time>
        </div>
      </div>

      <div class="selector-container glass-card page-panel">
        <div class="selector-grid">
          <AppSelect
            v-model="selectedArea"
            :options="areaOptions"
            :label="t('index.selectArea')"
            icon="sym_o_location_on"
            @update:model-value="clearLocation"
          />

          <AppSelect
            v-model="selectedCity"
            :options="filteredCityOptions"
            :label="t('index.selectCity')"
            icon="sym_o_apartment"
            :disable="!selectedArea"
            clearable
            @update:model-value="clearLocation"
          />
        </div>
        <div class="location-actions">
          <q-btn
            flat
            no-caps
            color="primary"
            class="location-button"
            icon="sym_o_my_location"
            :label="t('index.location.action')"
            :loading="locationLookup !== null"
            @click="useDeviceLocation"
          />
          <div class="location-status" role="status" aria-live="polite">{{ locationStatus }}</div>
        </div>
      </div>

      <div v-if="prices.length" class="today-results">
        <section class="today-chart">
          <h2 class="chart-heading">
            <q-icon class="panel-icon" name="sym_o_show_chart" aria-hidden="true" />
            {{ t('index.chartHeading', { city: getDisplayCity() }) }}
            <span class="chart-unit">{{ t('common.priceUnit') }}</span>
          </h2>
          <div class="chart-container">
            <canvas ref="chartCanvas" role="img" :aria-label="t('index.chartHeading', { city: getDisplayCity() })"></canvas>
          </div>
        </section>

        <PriceSummary :prices="prices" @highlight="setHighlight" />
      </div>

      <PriceLoadingSkeleton v-if="isLoading && !prices.length" />

      <q-banner v-if="hasError || noPrices" class="error-banner glass-card q-mt-lg q-pa-lg" rounded>
        <template v-slot:avatar>
          <q-icon name="sym_o_warning" color="warning" size="lg" />
        </template>
        <div class="text-body1 q-mb-sm"><strong>{{ t(noPrices ? 'common.noPrices' : 'common.errorTitle') }}</strong></div>
        <div v-if="hasError" class="text-body2 q-mb-md">
          {{ t('common.errorDescription') }}
        </div>
        <div class="q-mt-md">
          <q-btn :label="t('common.retry')" color="primary" @click="fetchTodaysPrices" unelevated rounded />
        </div>
      </q-banner>

      <HourlyPricesTable
        v-if="prices.length"
        :prices="prices"
        :current-row-key="currentPrice?.rowKey ?? null"
      />
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 10px;
}
.location-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-top: 12px;
}
.location-button {
  min-height: 44px;
  border: 1px solid var(--accent-edge);
  background: var(--accent-soft);
}
.location-status { color: var(--text-subtle); font-size: 0.84rem; }
.today-intro {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.today-intro :deep(.hero-section) { margin: 0; }
.today-current {
  display: grid;
  justify-items: end;
  gap: 5px;
  text-align: right;
}
.current-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 650;
  color: var(--text-subtle);
}
.today-current strong {
  margin-inline-end: 6px;
  font: 500 clamp(1.8rem, 4vw, 2.65rem) / 1.05 var(--data-font);
  letter-spacing: -0.075em;
}
.today-current small {
  font-size: 0.75rem;
  color: var(--text-subtle);
}
.today-current time {
  color: var(--text-subtle);
  font: 500 0.74rem var(--data-font);
}
.today-results {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}
.today-chart {
  min-width: 0;
  padding: clamp(12px, 2.2vw, 24px);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface-card);
  box-shadow: var(--panel-shadow);
}
.today-chart h2 {
  margin: 0 0 14px;
}
.chart-container {
  position: relative;
  height: clamp(245px, 30vw, 350px);
}
@media (max-width: 600px) {
  .today-intro {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: start;
  }
  .today-intro :deep(h1) { font-size: clamp(1.55rem, 6.3vw, 2rem); }
  .today-current {
    max-width: 136px;
    gap: 4px;
  }
  .today-current strong {
    font-size: clamp(1.45rem, 5.5vw, 1.8rem);
    margin: 0;
  }
  .today-current .current-label, .today-current time { font-size: 0.69rem; }
  .today-current small { display: block; }
}
</style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { getPriceDay } from 'src/scripts/priceData';
import HeroSection from 'src/components/HeroSection.vue';
import HourlyPricesTable from 'src/components/HourlyPricesTable.vue';
import AppSelect from 'src/components/AppSelect.vue';
import PriceSummary from 'src/components/PriceSummary.vue';
import PriceLoadingSkeleton from 'src/components/PriceLoadingSkeleton.vue';
import { getCurrentPriceIndex, useTableServices, type Price, type AreaCode, baseCities } from 'src/scripts/TableScript';
import { useChartServices } from 'src/scripts/ChartScript';
import { useBackendRequest } from 'src/scripts/useBackendRequest';
import { getOsloIsoDate, OSLO_TIME_ZONE } from 'src/scripts/osloTime';
import { useOsloClock } from 'src/scripts/useOsloClock';
import { useTaxMode } from 'src/composables/useTaxMode';

const { t, locale } = useI18n();
const now = useOsloClock();
const displayDate = computed(() =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: 'full', timeZone: OSLO_TIME_ZONE }).format(now.value),
);
const priceNumber = computed(() => new Intl.NumberFormat(locale.value, {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
}));
const { isTaxIncluded } = useTaxMode();

// Reactive state variables - simplified for today only
const selectedArea = ref<string | null>('NO1');
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

const currentPrice = computed(() => prices.value[getCurrentPriceIndex(prices.value, now.value)]);

type LocationIssue = 'unsupported' | 'denied' | 'timedOut' | 'unavailable' | 'outside' | 'uncertain' | 'mapError';
const locationLookup = shallowRef<AbortController | null>(null);
const locatedArea = ref<AreaCode | null>(null);
const locationIssue = ref<LocationIssue | null>(null);
const locationStatus = computed(() => {
  if (locationLookup.value) return t('index.location.locating');
  if (locationIssue.value) return t(`index.location.${locationIssue.value}`);
  if (locatedArea.value) {
    return t('index.location.matched', {
      area: t(`common.areas.${locatedArea.value}`),
      code: locatedArea.value,
    });
  }
  return '';
});

function clearLocation() {
  locationLookup.value?.abort();
  locationLookup.value = null;
  locationIssue.value = null;
  locatedArea.value = null;
}
onBeforeUnmount(clearLocation);

async function useDeviceLocation() {
  if (locationLookup.value) return;
  locationIssue.value = null;
  if (!window.isSecureContext || !navigator.geolocation) {
    locationIssue.value = 'unsupported';
    return;
  }

  const lookup = new AbortController();
  locationLookup.value = lookup;

  try {
    const fix = await new Promise<GeolocationPosition | GeolocationPositionError>((resolve) => {
      navigator.geolocation.getCurrentPosition(resolve, resolve, {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 0,
      });
    });
    if (locationLookup.value !== lookup) return;
    if ('code' in fix) {
      locationIssue.value = fix.code === 1 ? 'denied' : fix.code === 3 ? 'timedOut' : 'unavailable';
      return;
    }

    const timeout = setTimeout(() => lookup.abort(), 10_000);
    try {
      const { findPriceArea } = await import('src/scripts/priceAreaLocation');
      const result = await findPriceArea(fix.coords, lookup.signal);
      if (locationLookup.value !== lookup) return;
      if (result.kind === 'matched') {
        selectedCity.value = null;
        selectedArea.value = result.area;
        locatedArea.value = result.area;
      } else {
        locationIssue.value = result.kind;
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    if (locationLookup.value === lookup) locationIssue.value = 'mapError';
  } finally {
    if (locationLookup.value === lookup) locationLookup.value = null;
  }
}
const { isLoading, hasError, run } = useBackendRequest();
const noPrices = ref(false);

// Use table services
const {
  areaOptions,
  filteredCityOptions,
} = useTableServices(selectedArea);

// Use chart services
const { chartCanvas, createChart, setHighlight } = useChartServices();


async function fetchTodaysPrices() {
  noPrices.value = false;
  const today = getOsloIsoDate();
  const area = selectedArea.value ?? 'NO1';
  // Keep the chart mounted when switching cities in the same price area.
  if (rawPrices.value[0]?.area !== area || rawPrices.value[0]?.date !== today) {
    rawPrices.value = [];
  }

  await run(() => getPriceDay(area, today), async (day) => {
    rawPrices.value = day.map((price, index) => ({
      ...price,
      area,
      city: getDisplayCity(),
      date: today,
      rowKey: `${today}-${index}`,
    }));
    if (day.length) {
      await nextTick();
      renderChart();
    } else {
      noPrices.value = true;
    }
  });
}

watch(selectedArea, () => {
  selectedCity.value = null;
  void fetchTodaysPrices();
});

// (Re)draws the chart from the current `prices` (tax-adjusted) - used both after
// a fetch and whenever the tax-inclusion setting changes on already-loaded data.
function renderChart() {
  createChart(chartCanvas.value, prices.value);
}

watch(isTaxIncluded, async () => {
  if (!rawPrices.value.length) return;
  await nextTick();
  renderChart();
});

watch(() => getOsloIsoDate(now.value), () => void fetchTodaysPrices());
onMounted(() => void fetchTodaysPrices());

// Function to get the display city name
function getDisplayCity(): string {
  if (locatedArea.value) return t(`common.areas.${locatedArea.value}`);
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
