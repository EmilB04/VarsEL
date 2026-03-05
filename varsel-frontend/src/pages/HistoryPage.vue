<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <HeroSection title="Prishistorikk" description="Utforsk og analyser tidligere strømpriser" class="q-py-xl" />

      <q-form @submit.prevent="fetchPrices">
        <div class="selector-container glass-card q-pa-lg q-mb-lg">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="location_on" class="q-mr-sm" />
            Velg område
          </h3>
          <div class="row q-gutter-md">
            <q-select
              v-model="selectedArea"
              :options="areaOptions"
              label="Område"
              class="col-12 col-md"
              emit-value
              map-options
              filled
              standout
            >
              <template v-slot:prepend>
                <q-icon name="map" />
              </template>
            </q-select>

            <q-select
              v-model="selectedCity"
              :options="filteredCityOptions"
              label="By (valgfritt)"
              class="col-12 col-md"
              emit-value
              map-options
              :disable="!selectedArea"
              filled
              standout
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
            Velg dato
          </h3>
          <div class="row q-gutter-md items-end">
            <q-input
              v-model="date"
              label="Dato"
              type="date"
              :max="maxAllowedDate"
              class="col-12 col-md"
              filled
              standout
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-input>

            <div class="date-nav-buttons">
              <q-btn
                flat
                round
                icon="chevron_left"
                color="primary"
                @click="goToPreviousDay"
                :disable="!date"
                class="date-nav-btn"
              >
                <q-tooltip>Forrige dag</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                icon="chevron_right"
                color="primary"
                @click="goToNextDay"
                :disable="isNextDayDisabled || !date"
                class="date-nav-btn"
              >
                <q-tooltip>{{
                  isNextDayDisabled ? 'Kan bare se en dag frem' : 'Neste dag'
                }}</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <div class="selector-container glass-card q-pa-lg q-mb-lg">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="schedule" class="q-mr-sm" />
            Tidsfilter (valgfritt)
          </h3>
          <div class="row q-gutter-md">
            <q-select
              v-model="startHour"
              :options="
                [...Array(25).keys()].map((h) => ({
                  label: `${h.toString().padStart(2, '0')}:00`,
                  value: h,
                }))
              "
              label="Fra klokkeslett"
              class="col-12 col-md"
              emit-value
              map-options
              clearable
              filled
              standout
            >
              <template v-slot:prepend>
                <q-icon name="access_time" />
              </template>
            </q-select>

            <q-select
              v-model="endHour"
              :options="
                [...Array(25).keys()].map((h) => ({
                  label: `${h.toString().padStart(2, '0')}:00`,
                  value: h,
                }))
              "
              label="Til klokkeslett"
              class="col-12 col-md"
              emit-value
              map-options
              clearable
              filled
              standout
            >
              <template v-slot:prepend>
                <q-icon name="schedule" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="action-buttons q-mb-xl">
          <q-btn
            label="Hent priser"
            type="submit"
            color="primary"
            size="lg"
            :disable="!selectedArea || !date"
            icon="search"
            unelevated
            no-caps
          />
          <q-btn
            v-if="hasActiveFilters"
            label="Fjern filtre"
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
          Prisutvikling i {{ getDisplayCity() }}
        </h2>

        <div class="chart-container q-mb-xl">
          <canvas ref="chartCanvas" style="display: block; width: 100%; height: 100%"></canvas>
        </div>

        <PriceSummary :prices="prices" />
      </div>

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
            Detaljert prisoversikt
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
    background: rgba($primary, 0.1);

    &:hover {
      background: rgba($primary, 0.2);
    }
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
    background: linear-gradient(135deg, rgba(0, 217, 192, 0.1), rgba(99, 102, 241, 0.1));
    font-weight: 700;
    font-size: 0.875rem;
  }

  :deep(tbody tr:hover) {
    background: rgba(0, 217, 192, 0.05);
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
import { ref, watch, nextTick, computed } from 'vue';
import { api } from 'boot/axios';
import FooterSection from 'src/components/FooterSection.vue';
import HeroSection from 'src/components/HeroSection.vue';
import NavSection from 'src/components/NavSection.vue';
import PriceSummary from 'src/components/PriceSummary.vue';
import { useTableServices, type Price, baseCities } from 'src/scripts/TableScript';
import { useChartServices } from 'src/scripts/ChartScript';

// Reactive state variables - all start empty
const selectedArea = ref<string | null>(null);
const selectedCity = ref<string | null>(null);
const date = ref<string>('');
const startHour = ref<number | null>(null);
const endHour = ref<number | null>(null);
const prices = ref<Price[]>([]);
const isTaxIncluded = ref(false);

// Use table services with a computed ref that provides a default value
const selectedAreaForServices = computed(() => selectedArea.value || 'NO1');
const {
  areaOptions,
  columns,
  filteredCityOptions,
} = useTableServices(selectedAreaForServices);


// Use chart services
const { chartCanvas, createChart } = useChartServices();

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

async function fetchPrices() {
  // Validate required fields
  if (!selectedArea.value || !date.value) {
    console.error('Area and date are required');
    return;
  }

  const storedTaxPreference = localStorage.getItem('isTaxIncluded');
  isTaxIncluded.value = storedTaxPreference === 'true';

  try {
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

    // Enrich each object with area, city, and selected date
    const enrichedPrices = json.prices.map((price: Price) => {
      const adjustedPrice = isTaxIncluded.value
        ? price.NOK_per_kWh * 1.25 // Apply tax if included
        : price.NOK_per_kWh;

      return {
        ...price,
        NOK_per_kWh: adjustedPrice,
        area: selectedArea.value,
        city: selectedCity.value || baseCities[selectedArea.value as keyof typeof baseCities],
        date: date.value,
      };
    });

    prices.value = enrichedPrices;

    // Create chart after data is loaded and DOM is updated
    await nextTick();
    createChart(chartCanvas.value, prices.value);
  } catch (err) {
    console.error('Could not fetch prices', err);
  }
}

// Watch for changes in selectedArea to reset city selection
watch(selectedArea, () => {
  selectedCity.value = null;
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
  selectedCity.value = null;
  startHour.value = null;
  endHour.value = null;
  prices.value = [];
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
</script>
