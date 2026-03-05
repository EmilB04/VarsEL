<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <HeroSection
        title="Dagens strømpriser"
        description="Se strømpriser i sanntid og planlegg strømbruket ditt smart"
        class="q-py-xl"
      />

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

        <div class="chart-container q-mb-xl">
          <canvas ref="localCanvasRef" style="display: block; width: 100%; height: 100%"></canvas>
        </div>

        <PriceSummary :prices="prices" />
      </div>

      <div v-if="isLoading" class="loading-state q-mt-lg q-pa-xl text-center">
        <q-spinner-dots color="primary" size="50px" />
        <p class="q-mt-md text-subtitle1">Laster priser...</p>
      </div>

      <q-banner v-if="loadingTakingLong" class="glass-card q-mt-lg q-pa-lg" type="info" rounded>
        <template v-slot:avatar>
          <q-icon name="info" color="info" size="lg" />
        </template>
        <div class="text-body1"><strong>Henter data tar lengre tid enn forventet</strong></div>
        <div class="text-body2 q-mt-sm">
          Backend-tjenesten starter. Vennligst vent <strong>{{ formatCountdown(loadingCountdownSeconds) }}</strong>.
        </div>
      </q-banner>

      <q-banner v-if="hasError" class="error-banner glass-card q-mt-lg q-pa-lg" rounded>
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

// Loading & Error States
.loading-state {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

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
    background: rgba($primary, 0.05);
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
import { ref, nextTick, onMounted, watch } from 'vue';
import { api } from 'boot/axios';
import FooterSection from 'src/components/FooterSection.vue';
import HeroSection from 'src/components/HeroSection.vue';
import NavSection from 'src/components/NavSection.vue';
import PriceSummary from 'src/components/PriceSummary.vue';
import { useTableServices, type Price, baseCities } from 'src/scripts/TableScript';
import { useChartServices } from 'src/scripts/ChartScript';

// Reactive state variables - simplified for today only
const selectedArea = ref('NO1');
const selectedCity = ref<string | null>(null);
const prices = ref<Price[]>([]);
const isTaxIncluded = ref(false);
const isLoading = ref(false);
const hasError = ref(false);
const countdownSeconds = ref(180); // 3 minutes for error state
const loadingCountdownSeconds = ref(0); // Countdown for loading taking too long
const loadingTakingLong = ref(false); // Track if loading takes more than 2 seconds
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let loadingCountdownInterval: ReturnType<typeof setInterval> | null = null;
let loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;

// Use table services
const {
  areaOptions,
  filteredCityOptions,
} = useTableServices(selectedArea);

// Simplified columns for today's view
const simplifiedColumns = [
  { name: 'time_start', required: true, label: 'Tid', align: 'left' as const, field: 'time_start', sortable: true,
    format: (val: string) => val ? val.slice(11, 16) : '' },
  { name: 'NOK_per_kWh', required: true, label: 'Pris (kr/kWh)', align: 'right' as const, field: 'NOK_per_kWh', sortable: true,
    format: (val: number) => val.toFixed(3) },
];

// Use chart services
const { chartCanvas, createChart } = useChartServices();
const localCanvasRef = ref<HTMLCanvasElement | null>(null);

// Function to format countdown display (MM:SS)
function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Watch for error state changes to start/stop countdown
watch(hasError, (newValue) => {
  if (newValue) {
    countdownSeconds.value = 180; // Reset to 3 minutes
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      countdownSeconds.value--;
      if (countdownSeconds.value <= 0) {
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }, 1000);
  } else {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = null;
  }
});

// Watch for loading state changes to show alert if taking more than 2 seconds
watch(isLoading, (newValue) => {
  if (newValue) {
    loadingTakingLong.value = false;
    if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
    if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
    loadingTimeoutId = setTimeout(() => {
      loadingTakingLong.value = true;
      // Start countdown from 60 seconds when banner appears
      loadingCountdownSeconds.value = 60;
      if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
      loadingCountdownInterval = setInterval(() => {
        loadingCountdownSeconds.value--;
        if (loadingCountdownSeconds.value <= 0) {
          if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
          loadingCountdownInterval = null;
        }
      }, 1000);
    }, 2000);
  } else {
    loadingTakingLong.value = false;
    if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
    if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
    loadingTimeoutId = null;
    loadingCountdownInterval = null;
  }
});

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
