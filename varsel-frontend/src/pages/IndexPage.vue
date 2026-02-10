<template>
  <q-page class="modern-page q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <div class="hero-section q-mb-xl">
        <h1 class="text-h4 q-mb-md">Dagens strømpriser</h1>
        <p class="text-subtitle1 text-grey-7">Se strømpriser i sanntid og planlegg strømbruket ditt smart</p>
      </div>

      <div class="selector-container glass-card q-pa-lg q-mb-xl">
        <div class="row q-gutter-md">
          <q-select
            v-model="selectedArea"
            :options="areaOptions"
            label="Velg ditt område"
            class="col-12 col-md"
            emit-value
            map-options
            @update:model-value="fetchTodaysPrices"
            filled
            rounded
            standout
          >
            <template v-slot:prepend>
              <q-icon name="location_on" />
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
            @update:model-value="fetchTodaysPrices"
            filled
            rounded
            standout
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
          Prisutvikling i dag - {{ getDisplayCity() }}
        </h2>

        <div class="chart-container">
          <canvas ref="localCanvasRef" style="display: block; width: 100%; height: 100%"></canvas>
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
                    24 timer
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
          </div>
        </div>

        <div class="q-mt-xl">
          <div class="action-cards row q-gutter-md justify-center">
            <q-card class="action-card glass-card col-12 col-sm-5" @click="$router.push('/history')">
              <q-card-section class="text-center">
                <q-icon name="history" size="xl" color="primary" class="q-mb-md" />
                <div class="text-h6 q-mb-sm">Se historikk</div>
                <p class="text-grey-7 text-body2">Utforsk prishistorikk og trender</p>
                <q-btn flat color="primary" label="Gå til historikk" icon-right="arrow_forward" />
              </q-card-section>
            </q-card>

            <q-card class="action-card glass-card col-12 col-sm-5" @click="$router.push('/notifications')">
              <q-card-section class="text-center">
                <q-icon name="notifications_active" size="xl" color="secondary" class="q-mb-md" />
                <div class="text-h6 q-mb-sm">Sett opp varsler</div>
                <p class="text-grey-7 text-body2">Få beskjed når prisene er lave</p>
                <q-btn flat color="secondary" label="Konfigurer varsler" icon-right="arrow_forward" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state q-mt-lg q-pa-xl text-center">
        <q-spinner-dots color="primary" size="50px" />
        <p class="q-mt-md text-subtitle1">Laster priser...</p>
      </div>

      <q-banner v-if="hasError" class="error-banner glass-card q-mt-lg" rounded>
        <template v-slot:avatar>
          <q-icon name="warning" color="warning" size="lg" />
        </template>
        <div class="text-body1 q-mb-sm"><strong>Kunne ikke laste priser</strong></div>
        <div class="text-body2 q-mb-md">
          Hvis backend-tjenesten ikke kjører, kan du starte den manuelt:
        </div>
        <a href="https://varsel-hari.onrender.com/api/prices/" target="_blank" class="text-primary">
          https://varsel-hari.onrender.com/api/prices/
        </a>
        <div class="q-mt-md">
          <q-btn label="Prøv igjen" color="primary" @click="fetchTodaysPrices" unelevated rounded />
        </div>
      </q-banner>

      <q-table
        class="modern-table q-mt-xl"
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
            Dagens timespriser
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
.modern-page {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 2rem 0;

  .text-h4 {
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
}

.selector-container {
  padding: 2rem;
}

.chart-container {
  position: relative;
  height: 450px;
  width: 100%;
  margin-bottom: 2rem;
}

// Modern Price Cards
.price-card {
  text-align: center;
  padding: 0.5rem;
  border: 2px solid transparent;

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
    background: #10B981;
    color: white;
  }
  .price-value {
    color: #10B981;
  }
}

.highest-price {
  .card-icon {
    background: #EF4444;
    color: white;
  }
  .price-value {
    color: #EF4444;
  }
}

.current-price {
  .card-icon {
    background: #3B82F6;
    color: white;
  }
  .price-value {
    color: #3B82F6;
  }
}

.average-price {
  .card-icon {
    background: #F59E0B;
    color: white;
  }
  .price-value {
    color: #F59E0B;
  }
}

.difference-price {
  .card-icon {
    background: #8B5CF6;
    color: white;
  }
  .price-value {
    color: #8B5CF6;
  }
}

// Dark mode adjustments
.body--dark {
  .price-value {
    filter: brightness(1.3);
  }
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

// Loading & Error States
.loading-state {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.error-banner {
  padding: 1.5rem;

  a {
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
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

// Responsive adjustments
@media (max-width: 768px) {
  .hero-section {
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
}
</style>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { api } from 'boot/axios';
import FooterSection from 'src/components/FooterSection.vue';
import NavSection from 'src/components/NavSection.vue';
import { useTableServices, type Price, baseCities } from 'src/components/Index/TableScript';
import { useChartServices } from 'src/components/Index/ChartScript';

// Reactive state variables - simplified for today only
const selectedArea = ref('NO1');
const selectedCity = ref<string | null>(null);
const prices = ref<Price[]>([]);
const isTaxIncluded = ref(false);
const isLoading = ref(false);
const hasError = ref(false);

// Use table services
const {
  areaOptions,
  filteredCityOptions,
  getMinPrice,
  getMaxPrice,
  getAvgPrice,
  getPriceDifference,
  getMinPriceTime,
  getMaxPriceTime,
} = useTableServices(selectedArea);

// Simplified columns for today's view
const simplifiedColumns = [
  { name: 'time_start', required: true, label: 'Tid', align: 'left' as const, field: 'time_start', sortable: true,
    format: (val: string) => val ? val.slice(11, 16) : '' },
  { name: 'NOK_per_kWh', required: true, label: 'Pris (kr/kWh)', align: 'right' as const, field: 'NOK_per_kWh', sortable: true,
    format: (val: number) => val.toFixed(3) },
];

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
const localCanvasRef = ref<HTMLCanvasElement | null>(null);

async function fetchTodaysPrices() {
  const storedTaxPreference = localStorage.getItem('isTaxIncluded');
  isTaxIncluded.value = storedTaxPreference === 'true';

  try {
    isLoading.value = true;
    hasError.value = false;
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
      prices.value = [];
      isLoading.value = false;
      return;
    }

    // Enrich each object with area, city, and today's date
    const enrichedPrices = json.prices.map((price: Price) => {
      const adjustedPrice = isTaxIncluded.value
        ? price.NOK_per_kWh * 1.25 // Apply tax if included
        : price.NOK_per_kWh;

      return {
        ...price,
        NOK_per_kWh: adjustedPrice,
        area: selectedArea.value,
        city: selectedCity.value || baseCities[selectedArea.value as keyof typeof baseCities],
        date: today,
      };
    });

    prices.value = enrichedPrices;

    // Ensure DOM is updated and canvas ref is available
    await nextTick();

    // If the composable's chartCanvas is not bound, prefer the local canvas ref
    const canvasToUse = localCanvasRef.value ?? chartCanvas.value;
    if (!canvasToUse) {
      console.error('Chart creation failed - canvas or data missing');
    } else {
      createChart(canvasToUse, prices.value);
    }
    isLoading.value = false;
  } catch (err) {
    console.error('Could not fetch today\'s prices', err);
    hasError.value = true;
    isLoading.value = false;
  }
}

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
