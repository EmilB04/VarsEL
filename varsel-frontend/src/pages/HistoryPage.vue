<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <HeroSection title="Prishistorikk" description="Utforsk og analyser tidligere strømpriser" />

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

        <div class="chart-container">
          <canvas ref="chartCanvas" style="display: block; width: 100%; height: 100%"></canvas>
        </div>

        <div class="q-mt-xl">
          <h3 class="text-h6 q-mb-lg">Prissammendrag</h3>
          <div class="row q-gutter-md">
            <div class="col-12 col-sm-6 col-md">
              <q-card class="price-card glass-card lowest-price">
                <q-card-section>
                  <div class="card-icon">
                    <q-icon name="arrow_downward" size="lg" />
                  </div>
                  <div class="price-value">{{ getMinPrice(prices).toFixed(2) }}</div>
                  <div class="price-unit">kr/kWh</div>
                  <div class="price-label">Laveste pris</div>
                  <div class="price-time">
                    <q-icon name="schedule" size="xs" />
                    {{ getMinPriceTime(prices) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md">
              <q-card class="price-card glass-card highest-price">
                <q-card-section>
                  <div class="card-icon">
                    <q-icon name="arrow_upward" size="lg" />
                  </div>
                  <div class="price-value">{{ getMaxPrice(prices).toFixed(2) }}</div>
                  <div class="price-unit">kr/kWh</div>
                  <div class="price-label">Høyeste pris</div>
                  <div class="price-time">
                    <q-icon name="schedule" size="xs" />
                    {{ getMaxPriceTime(prices) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md">
              <q-card class="price-card glass-card difference-price">
                <q-card-section>
                  <div class="card-icon">
                    <q-icon name="trending_flat" size="lg" />
                  </div>
                  <div class="price-value">{{ getPriceDifference(prices).toFixed(2) }}</div>
                  <div class="price-unit">kr/kWh</div>
                  <div class="price-label">Forskjell</div>
                  <div class="price-time">
                    <q-icon name="compare_arrows" size="xs" />
                    Høy - Lav
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md">
              <q-card class="price-card glass-card average-price">
                <q-card-section>
                  <div class="card-icon">
                    <q-icon name="insights" size="lg" />
                  </div>
                  <div class="price-value">{{ getAvgPrice(prices).toFixed(2) }}</div>
                  <div class="price-unit">kr/kWh</div>
                  <div class="price-label">Gjennomsnitt</div>
                  <div class="price-time">
                    <q-icon name="hourglass_empty" size="xs" />
                    {{ prices.length }} timer
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md">
              <q-card class="price-card glass-card current-price">
                <q-card-section>
                  <div class="card-icon">
                    <q-icon name="schedule" size="lg" />
                  </div>
                  <div class="price-value">{{ getCurrentPrice(prices).toFixed(2) }}</div>
                  <div class="price-unit">kr/kWh</div>
                  <div class="price-label">Nåværende pris</div>
                  <div class="price-time">
                    <q-icon name="access_time" size="xs" />
                    Nå {{ new Date().getHours() }}:00
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
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
  padding: 2rem 0;

  .text-h4 {
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
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
    background: rgba(0, 217, 192, 0.1);

    &:hover {
      background: rgba(0, 217, 192, 0.2);
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
  margin-bottom: 2rem;
}

// Reuse price card styles from IndexPage
.price-card {
  text-align: center;
  padding: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: currentColor;
  }

  .card-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    margin: 0 auto 1rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
  }

  .price-value {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .price-unit {
    font-size: 0.875rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }

  .price-label {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .price-time {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    opacity: 0.7;
  }
}

.lowest-price {
  .card-icon {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .price-value {
    color: #10b981;
  }
}

.highest-price {
  .card-icon {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }

  .price-value {
    color: #ef4444;
  }
}

.current-price {
  .card-icon {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
  }

  .price-value {
    color: #3b82f6;
  }
}

.average-price {
  .card-icon {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }

  .price-value {
    color: #f59e0b;
  }
}

.difference-price {
  .card-icon {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
  }

  .price-value {
    color: #8b5cf6;
  }
}

.body--dark {
  .price-value {
    filter: brightness(1.3);
  }
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

  .price-card {
    .price-value {
      font-size: 2rem;
    }
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
  getMinPrice,
  getMaxPrice,
  getAvgPrice,
  getPriceDifference,
  getMinPriceTime,
  getMaxPriceTime,
} = useTableServices(selectedAreaForServices);

// Function to get current price based on current hour
function getCurrentPrice(prices: Price[]): number {
  if (!prices.length) return 0;

  const now = new Date();
  const currentHour = now.getHours();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;

  // Find price for current hour
  const currentPriceEntry = prices.find((price) => {
    if (!price.time_start) return false;
    const priceHour = price.time_start.slice(11, 16); // Extract HH:MM from time_start
    return priceHour === currentTime;
  });

  return currentPriceEntry ? currentPriceEntry.NOK_per_kWh : 0;
}

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
