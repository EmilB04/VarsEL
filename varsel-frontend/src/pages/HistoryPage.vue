<template>
  <q-page class="app-page history-page">
    <main>
      <HeroSection :title="t('history.heroTitle')" :description="t('history.heroDescription')" />

      <q-form novalidate class="history-filters" @submit.prevent="fetchPrices">
        <div class="filter-grid">
          <section class="filter-group" aria-labelledby="history-area">
            <h2 id="history-area" class="filter-title">
              <q-icon name="sym_o_location_on" class="panel-icon" aria-hidden="true" />
              {{ t('history.selectAreaSection') }}
            </h2>
            <div class="filter-fields">
              <AppSelect
                v-model="selectedArea"
                :options="areaOptions"
                :label="t('history.area')"
                icon="sym_o_map"
              />
              <AppSelect
                v-model="selectedCity"
                :options="filteredCityOptions"
                :label="t('history.selectCity')"
                icon="sym_o_apartment"
                :disable="!selectedArea"
                clearable
              />
            </div>
          </section>

          <section class="filter-group" aria-labelledby="history-date">
            <h2 id="history-date" class="filter-title">
              <q-icon name="sym_o_event" class="panel-icon" aria-hidden="true" />
              {{ t('history.selectDateSection') }}
            </h2>
            <div class="filter-fields">
              <button
                type="button"
                class="date-trigger"
                :class="{ 'date-trigger--open': datePickerOpen }"
                :aria-expanded="datePickerOpen"
                aria-haspopup="dialog"
                @click="datePickerOpen = !datePickerOpen"
              >
                <q-icon name="sym_o_calendar_today" class="field-icon" aria-hidden="true" />
                <span class="date-trigger-copy">
                  <span class="date-label" :class="{ 'date-label--filled': date }">{{
                    t('history.date')
                  }}</span>
                  <strong v-if="date">{{ formattedDate }}</strong>
                </span>
                <q-icon name="sym_o_keyboard_arrow_down" size="20px" aria-hidden="true" />

                <q-popup-proxy
                  v-model="datePickerOpen"
                  no-parent-event
                  anchor="bottom left"
                  self="top left"
                  :offset="[0, 8]"
                  transition-show="jump-down"
                  transition-hide="jump-up"
                  role="dialog"
                  :aria-label="t('history.selectDateSection')"
                >
                  <div class="history-calendar" @keydown.esc.stop="datePickerOpen = false">
                    <q-date
                      :model-value="date || null"
                      mask="YYYY-MM-DD"
                      :default-year-month="toCalendarMonth(osloToday)"
                      :navigation-min-year-month="toCalendarMonth(earliestDate)"
                      :navigation-max-year-month="toCalendarMonth(maxAllowedDate)"
                      :options="isDateSelectable"
                      flat
                      minimal
                      color="primary"
                      @update:model-value="selectCalendarDate"
                    />
                    <div class="calendar-actions">
                      <q-btn
                        flat
                        no-caps
                        color="primary"
                        :label="t('history.today')"
                        @click="selectCalendarDate(osloToday)"
                      />
                      <q-btn
                        flat
                        no-caps
                        :label="t('common.close')"
                        @click="datePickerOpen = false"
                      />
                    </div>
                  </div>
                </q-popup-proxy>
              </button>

              <div class="date-nav">
                <q-btn
                  flat
                  type="button"
                  icon="sym_o_chevron_left"
                  :aria-label="t('history.previousDay')"
                  :disable="!date || date <= earliestDate"
                  @click="moveDate(-1)"
                >
                  <q-tooltip>{{ t('history.previousDay') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  no-caps
                  type="button"
                  icon="sym_o_today"
                  :label="t('history.today')"
                  @click="applyQuickDate(osloToday)"
                />
                <q-btn
                  flat
                  type="button"
                  icon="sym_o_chevron_right"
                  :aria-label="t('history.nextDay')"
                  :disable="!date || date >= maxAllowedDate"
                  @click="moveDate(1)"
                >
                  <q-tooltip>{{ t('history.nextDay') }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </section>

          <section class="filter-group" aria-labelledby="history-hours">
            <h2 id="history-hours" class="filter-title">
              <q-icon name="sym_o_schedule" class="panel-icon" aria-hidden="true" />
              {{ t('history.timeFilterSection') }}
            </h2>
            <div class="filter-fields">
              <AppSelect
                v-model="startHour"
                :options="startHourOptions"
                :label="t('history.startHour')"
                icon="sym_o_schedule"
                clearable
              />
              <AppSelect
                v-model="endHour"
                :options="endHourOptions"
                :label="t('history.endHour')"
                icon="sym_o_schedule"
                clearable
              />
            </div>
            <p v-if="invalidHours" class="filter-error" role="alert">
              {{ t('history.invalidHours') }}
            </p>
          </section>
        </div>

        <div class="filter-actions">
          <q-btn
            :label="t('history.clearFilters')"
            type="button"
            icon="sym_o_restart_alt"
            :disable="!hasActiveFilters"
            flat
            no-caps
            @click="clearFilters"
          />
          <q-btn
            :label="t('history.fetchButton')"
            type="submit"
            color="primary"
            :disable="!canFetch"
            :loading="isLoading"
            icon="sym_o_search"
            unelevated
            no-caps
          />
        </div>
      </q-form>

      <div v-if="prices.length" class="history-results">
        <section class="history-chart">
          <h2 class="chart-heading">
            <q-icon name="sym_o_show_chart" class="panel-icon" aria-hidden="true" />
            {{ t('history.chartHeading', { city: resultCity }) }}
            <span class="chart-unit">{{ t('common.priceUnit') }}</span>
          </h2>
          <p class="history-result-date">{{ displayDate(prices[0]?.date ?? '') }}</p>
          <div class="chart-container">
            <canvas
              ref="chartCanvas"
              role="img"
              :aria-label="t('history.chartHeading', { city: resultCity })"
            ></canvas>
          </div>
        </section>
        <PriceSummary :prices="prices" @highlight="setHighlight" />
      </div>

      <div v-else-if="!isLoading && !hasError && !noPrices" class="history-empty">
        <q-icon name="sym_o_history" size="24px" class="panel-icon" aria-hidden="true" />
        <p>{{ t('history.empty') }}</p>
      </div>

      <PriceLoadingSkeleton v-if="isLoading && !prices.length" />

      <q-banner
        v-if="hasError || noPrices"
        class="error-banner glass-card q-mt-lg q-pa-lg"
        role="status"
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="sym_o_warning" color="warning" size="lg" />
        </template>
        <div class="text-body1 q-mb-sm">
          <strong>{{ t(noPrices ? 'common.noPrices' : 'common.errorTitle') }}</strong>
        </div>
        <div v-if="hasError" class="text-body2 q-mb-md">
          {{ t('common.errorDescription') }}
        </div>
        <div class="q-mt-md">
          <q-btn
            :label="t('common.retry')"
            color="primary"
            :disable="!canFetch"
            @click="fetchPrices"
            unelevated
            no-caps
          />
        </div>
      </q-banner>

      <q-table
        class="price-table q-mt-xl"
        v-if="prices.length"
        :rows="prices"
        :columns="columns"
        :visible-columns="$q.screen.lt.sm ? mobileColumns : undefined"
        :pagination="{ rowsPerPage: 12 }"
        row-key="rowKey"
        flat
      >
        <template v-slot:top>
          <h2 class="table-heading">
            <q-icon name="sym_o_table_chart" class="panel-icon" aria-hidden="true" />
            {{ t('history.tableHeading') }}
          </h2>
        </template>
      </q-table>
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.history-filters,
.history-chart {
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface-card);
  box-shadow: var(--panel-shadow);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.filter-group {
  min-width: 0;
  padding: clamp(12px, 2vw, 20px);
}
.filter-group + .filter-group {
  border-inline-start: 1px solid var(--border);
}
.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 0.98rem;
  font-weight: 650;
  line-height: 1.3;
}
.filter-fields {
  display: grid;
  gap: 8px;
}
.filter-error {
  margin: 10px 0 0;
  color: var(--danger-ink);
  font-size: 0.85rem;
}
.filter-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px clamp(12px, 2vw, 20px);
  border-top: 1px solid var(--border);
}
.filter-actions :deep(.q-btn) {
  min-height: 44px;
}

.date-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  padding: 8px 13px;
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  background: var(--surface);
  color: var(--text-subtle);
  text-align: start;
  font: inherit;
}
.date-trigger:hover {
  border-color: var(--border-hover);
}
.date-trigger--open {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.date-trigger-copy {
  display: grid;
  flex: 1;
  min-width: 0;
}
.date-label {
  font-size: 0.94rem;
}
.date-label--filled {
  font-size: 0.74rem;
  font-weight: 600;
}
.date-trigger strong {
  color: var(--app-ink);
  font-size: 0.95rem;
  font-weight: 650;
}
.date-nav {
  display: grid;
  grid-template-columns: auto 1fr auto;
  min-height: 56px;
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  background: var(--surface);
}
.date-nav :deep(.q-btn) {
  min-width: 44px;
  min-height: 44px;
  color: var(--text-subtle);
}
.date-nav :deep(.q-btn:not(.disabled):hover) {
  color: var(--q-primary);
}
.history-calendar {
  width: min(19rem, calc(100vw - 52px));
  border-radius: var(--panel-radius);
  background: var(--surface-card);
  color: var(--app-ink);
}
.history-calendar :deep(.q-date) {
  width: 100%;
  min-width: 0;
  box-shadow: none;
  background: transparent;
}
.calendar-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-top: 1px solid var(--border);
}

.history-results {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}
.history-chart {
  min-width: 0;
  padding: clamp(12px, 2.2vw, 24px);
}
.history-chart h2 {
  margin: 0;
}
.history-result-date {
  margin: 6px 0 14px;
  color: var(--text-subtle);
}
.history-chart .chart-container {
  position: relative;
  height: clamp(245px, 31vw, 380px);
}
.history-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: clamp(12px, 2vw, 20px);
  border: 1px dashed var(--border-hover);
  border-radius: var(--panel-radius);
  color: var(--text-subtle);
}
.history-empty p,
.table-heading {
  margin: 0;
}

@media (max-width: 780px) {
  .filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .filter-group + .filter-group {
    border-inline-start: 0;
    border-top: 1px solid var(--border);
  }
}
@media (max-width: 520px) {
  .filter-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .filter-actions :deep(.q-btn) {
    width: 100%;
    padding-inline: 6px;
  }
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppSelect from 'src/components/AppSelect.vue';
import HeroSection from 'src/components/HeroSection.vue';
import PriceLoadingSkeleton from 'src/components/PriceLoadingSkeleton.vue';
import PriceSummary from 'src/components/PriceSummary.vue';
import { useTaxMode } from 'src/composables/useTaxMode';
import { useChartServices } from 'src/scripts/ChartScript';
import {
  AREA_CODES,
  baseCities,
  useTableServices,
  type AreaCode,
  type Price,
} from 'src/scripts/TableScript';
import { addOsloDays, getOsloIsoDate, parseIsoDate } from 'src/scripts/osloTime';
import { getPriceDay } from 'src/scripts/priceData';
import { useBackendRequest } from 'src/scripts/useBackendRequest';
import { useOsloClock } from 'src/scripts/useOsloClock';

const { t, locale } = useI18n();
const now = useOsloClock();
const osloToday = computed(() => getOsloIsoDate(now.value));
const maxAllowedDate = computed(() => addOsloDays(osloToday.value, 1));
const earliestDate = '2021-01-01';
const historyFiltersKey = 'historyPageFilters';
const mobileColumns = ['time_start', 'time_end', 'NOK_per_kWh'];

const selectedArea = ref<string | null>(null);
const selectedCity = ref<string | null>(null);
const date = ref('');
const startHour = ref<number | null>(null);
const endHour = ref<number | null>(null);
const datePickerOpen = ref(false);
const noPrices = ref(false);
const rawPrices = ref<Price[]>([]);
let restoringFilters = false;

const { areaOptions, columns, filteredCityOptions } = useTableServices(selectedArea);
const { isLoading, hasError, reset, run } = useBackendRequest();
const { chartCanvas, createChart, setHighlight } = useChartServices();
const { isTaxIncluded } = useTaxMode();
const prices = computed(() =>
  rawPrices.value.map((price) => ({
    ...price,
    NOK_per_kWh: isTaxIncluded.value ? price.NOK_per_kWh * 1.25 : price.NOK_per_kWh,
  })),
);
const resultCity = computed(() => rawPrices.value[0]?.city ?? '');
const formattedDate = computed(() => displayDate(date.value));
const invalidHours = computed(() => (startHour.value ?? 0) >= (endHour.value ?? 24));
const canFetch = computed(
  () => !!selectedArea.value && isDateSelectable(date.value) && !invalidHours.value,
);
const hasActiveFilters = computed(
  () =>
    Boolean(selectedArea.value || selectedCity.value || date.value) ||
    startHour.value !== null ||
    endHour.value !== null,
);

const hourOptions = Array.from({ length: 25 }, (_, hour) => ({
  label: `${String(hour).padStart(2, '0')}:00`,
  value: hour,
}));
const startHourOptions = computed(() =>
  hourOptions
    .slice(0, 24)
    .filter(({ value }) => value < (endHour.value ?? 24) || value === startHour.value),
);
const endHourOptions = computed(() =>
  hourOptions
    .slice(1)
    .filter(({ value }) => value > (startHour.value ?? 0) || value === endHour.value),
);

function displayDate(day: string) {
  if (!parseIsoDate(day)) return day;
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

function toCalendarMonth(day: string) {
  return day.slice(0, 7).replace('-', '/');
}

function isDateSelectable(input: string) {
  const day = input.replaceAll('/', '-');
  return !!parseIsoDate(day) && day >= earliestDate && day <= maxAllowedDate.value;
}

function selectCalendarDate(day: string | null) {
  if (!day || !isDateSelectable(day)) return;
  date.value = day.replaceAll('/', '-');
  datePickerOpen.value = false;
}

function applyQuickDate(day: string) {
  if (!isDateSelectable(day)) return;
  date.value = day;
  void fetchPrices();
}

function moveDate(offset: number) {
  if (date.value) applyQuickDate(addOsloDays(date.value, offset));
}

async function fetchPrices() {
  const area = selectedArea.value;
  const day = date.value;
  if (!area || !canFetch.value) return;
  const city =
    filteredCityOptions.value.find(({ value }) => value === selectedCity.value)?.label ??
    baseCities[area as AreaCode];
  const start = startHour.value ?? 0;
  const end = endHour.value ?? 24;

  noPrices.value = false;
  rawPrices.value = [];
  await run(
    () => getPriceDay(area, day),
    (pricesForDay) => {
      rawPrices.value = pricesForDay.flatMap((price, index) => {
        const hour = Number(price.time_start.slice(11, 13));
        return hour >= start && hour < end
          ? [{ ...price, area, city, date: day, rowKey: `${day}-${index}` }]
          : [];
      });
      noPrices.value = !rawPrices.value.length;
    },
  );
}

function clearFilters() {
  reset();
  selectedArea.value = null;
  selectedCity.value = null;
  date.value = '';
  startHour.value = null;
  endHour.value = null;
  rawPrices.value = [];
  noPrices.value = false;
}

function restoreFilters() {
  const stored = localStorage.getItem(historyFiltersKey);
  if (!stored) return;
  restoringFilters = true;
  try {
    const values = JSON.parse(stored) as {
      selectedArea?: unknown;
      selectedCity?: unknown;
      date?: unknown;
      startHour?: unknown;
      endHour?: unknown;
    } | null;
    if (!values) return;
    selectedArea.value = AREA_CODES.find((area) => area === values.selectedArea) ?? null;
    selectedCity.value =
      filteredCityOptions.value.find(({ value }) => value === values.selectedCity)?.value ?? null;
    date.value =
      typeof values.date === 'string' && isDateSelectable(values.date) ? values.date : '';
    startHour.value =
      hourOptions.slice(0, 24).find(({ value }) => value === values.startHour)?.value ?? null;
    endHour.value =
      hourOptions.slice(1).find(({ value }) => value === values.endHour)?.value ?? null;
  } catch {
    localStorage.removeItem(historyFiltersKey);
  } finally {
    restoringFilters = false;
  }
}

watch(
  selectedArea,
  () => {
    if (!restoringFilters) selectedCity.value = null;
  },
  { flush: 'sync' },
);

watch([selectedArea, selectedCity, date, startHour, endHour], ([area, city, day, start, end]) => {
  if (!hasActiveFilters.value) {
    localStorage.removeItem(historyFiltersKey);
    return;
  }
  localStorage.setItem(
    historyFiltersKey,
    JSON.stringify({
      selectedArea: area,
      selectedCity: city,
      date: day,
      startHour: start,
      endHour: end,
    }),
  );
});

watch(
  prices,
  (value) => {
    if (value.length) createChart(chartCanvas.value, value);
  },
  { flush: 'post' },
);

onMounted(() => {
  restoreFilters();
  void fetchPrices();
});
</script>
