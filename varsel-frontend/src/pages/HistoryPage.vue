<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <HeroSection :title="t('history.heroTitle')" :description="t('history.heroDescription')" class="q-py-xl" />

      <q-form @submit.prevent="fetchPrices">
        <div class="selector-container glass-card q-pa-lg q-mb-lg">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="location_on" class="q-mr-sm" />
            {{ t('history.selectAreaSection') }}
          </h3>
          <div class="row q-gutter-md">
            <q-select
              v-model="selectedArea"
              :options="areaOptions"
              :label="t('history.area')"
              class="col-12 col-md"
              emit-value
              map-options
              filled
            >
              <template v-slot:prepend>
                <q-icon name="map" />
              </template>
            </q-select>

            <q-select
              v-model="selectedCity"
              :options="filteredCityOptions"
              :label="t('history.selectCity')"
              class="col-12 col-md"
              emit-value
              map-options
              :disable="!selectedArea"
              filled
            >
              <template v-slot:prepend>
                <q-icon name="apartment" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="selector-container glass-card q-pa-lg q-mb-lg">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="event" class="q-mr-sm" />
            {{ t('history.selectDateSection') }}
          </h3>
          <div class="row q-gutter-md items-end">
            <q-input
              :model-value="formattedDate"
              :label="t('history.date')"
              class="col-12 col-md date-display-input"
              filled
              readonly
              @click="datePopupRef?.show()"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" class="cursor-pointer">
                  <q-popup-proxy ref="datePopupRef" cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="date"
                      mask="YYYY-MM-DD"
                      :options="isDateSelectable"
                      :locale="dateLocale"
                      today-btn
                      flat
                      color="primary"
                      @update:model-value="onCalendarPick"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <div class="date-nav-buttons">
              <q-btn
                flat
                round
                size="lg"
                icon="chevron_left"
                color="primary"
                @click="goToPreviousDay"
                :disable="!date"
                class="date-nav-btn"
              >
                <q-tooltip>{{ t('history.previousDay') }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                size="lg"
                icon="today"
                color="primary"
                @click="goToToday"
                class="date-nav-btn"
              >
                <q-tooltip>{{ t('history.today') }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                size="lg"
                icon="chevron_right"
                color="primary"
                @click="goToNextDay"
                :disable="isNextDayDisabled || !date"
                class="date-nav-btn"
              >
                <q-tooltip>{{
                  isNextDayDisabled ? t('history.nextDayDisabled') : t('history.nextDay')
                }}</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <div class="selector-container glass-card q-pa-lg q-mb-lg">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="schedule" class="q-mr-sm" />
            {{ t('history.timeFilterSection') }}
          </h3>
          <div class="row q-gutter-md">
            <q-select
              v-model="startHour"
              :options="hourOptions"
              :label="t('history.startHour')"
              class="col-12 col-md"
              emit-value
              map-options
              clearable
              filled
            >
              <template v-slot:prepend>
                <q-icon name="access_time" />
              </template>
            </q-select>

            <q-select
              v-model="endHour"
              :options="hourOptions"
              :label="t('history.endHour')"
              class="col-12 col-md"
              emit-value
              map-options
              clearable
              filled
            >
              <template v-slot:prepend>
                <q-icon name="schedule" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="action-buttons q-mb-xl">
          <q-btn
            :label="t('history.fetchButton')"
            type="submit"
            color="primary"
            size="lg"
            :disable="!selectedArea || !date"
            :loading="isLoading"
            icon="search"
            unelevated
            no-caps
          />
          <q-btn
            v-if="hasActiveFilters"
            :label="t('history.clearFilters')"
            type="button"
            color="negative"
            size="lg"
            @click="clearFilters"
            icon="clear"
            outline
            no-caps
          />
        </div>
      </q-form>

      <div v-if="prices.length" class="q-mt-lg">
        <h2 class="text-h5 q-mb-lg">
          <q-icon name="trending_up" size="sm" class="q-mr-sm" />
          {{ t('history.chartHeading', { city: getDisplayCity() }) }}
        </h2>

        <div class="chart-container q-mb-xl">
          <canvas ref="chartCanvas" style="display: block; width: 100%; height: 100%"></canvas>
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
          <q-btn :label="t('common.retry')" color="primary" @click="fetchPrices" unelevated rounded />
        </div>
      </q-banner>

      <q-table
        class="modern-table q-mt-xl"
        v-if="prices.length"
        :rows="prices"
        :columns="columns"
        row-key="time_start"
        flat
      >
        <template v-slot:top>
          <div class="text-h6">
            <q-icon name="table_chart" class="q-mr-sm" />
            {{ t('history.tableHeading') }}
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

.selector-container {
  h3 {
    display: flex;
    align-items: center;
    font-weight: 600;
  }
}

.date-nav-buttons {
  display: flex;
  gap: 0.5rem;

  .date-nav-btn {
    background: color-mix(in srgb, var(--q-primary) 10%, transparent);
    min-width: 48px;
    min-height: 48px;

    &:hover {
      background: color-mix(in srgb, var(--q-primary) 20%, transparent);
    }
  }
}

.date-display-input {
  cursor: pointer;

  :deep(.q-field__control) {
    cursor: pointer;
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.chart-container {
  position: relative;
  height: 450px;
  width: 100%;
}

// Modern Table
.modern-table {
  border-radius: 16px;
  overflow: hidden;

  :deep(thead tr th) {
    background: linear-gradient(135deg, color-mix(in srgb, var(--q-primary) 10%, transparent), rgba($secondary, 0.1));
    font-weight: 700;
    font-size: 0.875rem;
  }

  :deep(tbody tr:hover) {
    background: color-mix(in srgb, var(--q-primary) 5%, transparent);
  }
}

@media (max-width: 768px) {
  :deep(.hero-section) {
    padding: 1rem 0;

    .text-h4 {
      font-size: 1.75rem;
    }
  }

  .chart-container {
    height: 300px;
  }

  .action-buttons {
    flex-direction: column;

    .q-btn {
      width: 100%;
    }
  }
}
</style>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted } from 'vue';
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

const { t, locale } = useI18n();

// Clock times are language-invariant - shared by both the start/end hour selects
const hourOptions = computed(() =>
  [...Array(25).keys()].map((h) => ({ label: `${h.toString().padStart(2, '0')}:00`, value: h })),
);

// Norwegian day/month names for the q-date popup - Quasar only ships an English default.
const NO_DATE_LOCALE = {
  days: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'],
  daysShort: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
  months: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],
  monthsShort: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
  firstDayOfWeek: 1, // Monday
};
const dateLocale = computed(() => (locale.value === 'no-NO' ? NO_DATE_LOCALE : undefined));

const datePopupRef = ref<{ show: () => void; hide: () => void } | null>(null);

// Reactive state variables - initialized with saved values or defaults
const selectedArea = ref<string | null>(null);
const selectedCity = ref<string | null>(null);
const date = ref<string>('');
const startHour = ref<number | null>(null);
const endHour = ref<number | null>(null);
const { isTaxIncluded } = useTaxMode();
// Prices as returned by the backend, tax-excluded - the tax multiplier is applied
// reactively in `prices` below, so toggling "Incl./Excl. VAT" updates instantly.
const rawPrices = ref<Price[]>([]);
const prices = computed<Price[]>(() =>
  rawPrices.value.map((price) => ({
    ...price,
    NOK_per_kWh: isTaxIncluded.value ? price.NOK_per_kWh * 1.25 : price.NOK_per_kWh,
  })),
);

const { isLoading, hasError, loadingTakingLong, loadingCountdownSeconds, run } = useBackendRequest();

// Flag to track if we're currently restoring from storage
const isRestoringFilters = ref(false);

// Filter state key for localStorage
const HISTORY_FILTERS_KEY = 'historyPageFilters';

// Function to save filter state to localStorage
function saveFiltersToStorage() {
  const filters = {
    selectedArea: selectedArea.value,
    selectedCity: selectedCity.value,
    date: date.value,
    startHour: startHour.value,
    endHour: endHour.value,
  };
  localStorage.setItem(HISTORY_FILTERS_KEY, JSON.stringify(filters));
}

// Function to restore filter state from localStorage
function restoreFiltersFromStorage() {
  isRestoringFilters.value = true;
  const stored = localStorage.getItem(HISTORY_FILTERS_KEY);
  if (stored) {
    try {
      const filters = JSON.parse(stored);
      selectedArea.value = filters.selectedArea || null;
      selectedCity.value = filters.selectedCity || null;
      date.value = filters.date || '';
      startHour.value = filters.startHour || null;
      endHour.value = filters.endHour || null;
    } catch (err) {
      console.error('Error restoring filters:', err);
    }
  }
  isRestoringFilters.value = false;
}

// Use table services with a computed ref that provides a default value
const selectedAreaForServices = computed(() => selectedArea.value || 'NO1');
const {
  areaOptions,
  columns,
  filteredCityOptions,
} = useTableServices(selectedAreaForServices);


// Use chart services
const { chartCanvas, createChart, setHighlight } = useChartServices();

// Computed property to check if there are active filters
const hasActiveFilters = computed(() => {
  return selectedCity.value !== null || startHour.value !== null || endHour.value !== null;
});

// Computed property to check if next day button should be disabled
const isNextDayDisabled = computed(() => {
  if (!date.value) return true;

  const currentDate = new Date(date.value);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());

  // Disable if current date is already tomorrow or later
  return currentDate >= tomorrow;
});

// Computed property for maximum allowed date (tomorrow)
const maxAllowedDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
});

// Long, locale-aware display of the selected date in the (readonly) input -
// the actual value stored/sent to the backend stays the plain ISO `date` ref.
const formattedDate = computed(() => {
  if (!date.value) return '';
  const [year, month, day] = date.value.split('-').map(Number);
  if (!year || !month || !day) return date.value;
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(new Date(year, month - 1, day));
});

// Keeps the calendar popup from ever offering a date beyond "tomorrow".
// Quasar always calls `options` with dates in "YYYY/MM/DD" format regardless
// of the `mask` prop, so normalize to dashes before comparing to maxAllowedDate.
function isDateSelectable(dateStr: string): boolean {
  return dateStr.replace(/\//g, '-') <= maxAllowedDate.value;
}

// Closes the popup as soon as a day is picked, and keeps the same
// "user must still press Hent priser" behavior the old native picker had.
function onCalendarPick() {
  datePopupRef.value?.hide();
}

async function fetchPrices() {
  // Validate required fields
  if (!selectedArea.value || !date.value) {
    console.error('Area and date are required');
    return;
  }

  await run(async () => {
    // Use city if chosen, else use area
    const regionParam = selectedCity.value || selectedArea.value;
    const url = `/prices/${regionParam}/${date.value}`;

    // Build query parames dynamically with standard values
    const params: Record<string, number> = {
      startHour: startHour.value ?? 0, // Standard 0 if null
      endHour: endHour.value ?? 24, // Standard 24 if null
    };

    // Send GET-call to backend
    const response = await api.get(url, { params });

    // If reponse is string (from Java), parse it
    const json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    // Validate that the backend returned a prices array
    if (!json || !Array.isArray(json.prices) || json.prices.length === 0) {
      console.warn('API returned no price data or invalid format', json);
      hasError.value = true;
      rawPrices.value = [];
      return;
    }

    // Enrich each object with area, city, and selected date (tax-excluded -
    // `prices` applies the multiplier reactively based on the current setting)
    rawPrices.value = json.prices.map((price: Price) => ({
      ...price,
      area: selectedArea.value,
      city: selectedCity.value || baseCities[selectedArea.value as keyof typeof baseCities],
      date: date.value,
    }));

    // Create chart after data is loaded and DOM is updated
    await nextTick();
    createChart(chartCanvas.value, prices.value);
  });
}

watch(isTaxIncluded, async () => {
  if (!rawPrices.value.length) return;
  await nextTick();
  createChart(chartCanvas.value, prices.value);
});

// Watch for changes in selectedArea to reset city selection
watch(selectedArea, () => {
  // Only reset city if user manually changed area (not during restore)
  if (!isRestoringFilters.value) {
    selectedCity.value = null;
  }
  saveFiltersToStorage();
});

// Watch all filter changes and save to localStorage
watch(selectedCity, () => saveFiltersToStorage());
watch(date, () => saveFiltersToStorage());
watch(startHour, () => saveFiltersToStorage());
watch(endHour, () => saveFiltersToStorage());

// Restore filters on component mount
onMounted(async () => {
  restoreFiltersFromStorage();

  // Auto-fetch if required filters are restored
  if (selectedArea.value && date.value) {
    await nextTick();
    void fetchPrices();
  }
});

// No auto-fetch on mount - user must manually fetch prices

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

// Function to clear all filters and reset to defaults
function clearFilters() {
  selectedArea.value = null;
  selectedCity.value = null;
  date.value = '';
  startHour.value = null;
  endHour.value = null;
  rawPrices.value = [];
  localStorage.removeItem(HISTORY_FILTERS_KEY);
  // Don't auto-fetch after clearing filters
}

// Function to go to previous day
function goToPreviousDay() {
  if (!date.value) {
    // If no date selected, use today
    date.value = new Date().toISOString().slice(0, 10);
  }

  const currentDate = new Date(date.value);
  currentDate.setDate(currentDate.getDate() - 1);
  date.value = currentDate.toISOString().slice(0, 10);

  // Auto-fetch when using navigation buttons if area is selected
  if (selectedArea.value) {
    void fetchPrices();
  }
}

// Function to go to next day
function goToNextDay() {
  if (!date.value) {
    // If no date selected, use today
    date.value = new Date().toISOString().slice(0, 10);
  }

  const currentDate = new Date(date.value);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Only allow going one day ahead from today
  if (currentDate < tomorrow) {
    currentDate.setDate(currentDate.getDate() + 1);
    date.value = currentDate.toISOString().slice(0, 10);

    // Auto-fetch when using navigation buttons if area is selected
    if (selectedArea.value) {
      void fetchPrices();
    }
  }
}

// Function to jump straight back to today
function goToToday() {
  date.value = new Date().toISOString().slice(0, 10);

  if (selectedArea.value) {
    void fetchPrices();
  }
}
</script>
