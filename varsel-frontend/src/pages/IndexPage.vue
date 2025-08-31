<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <div class="row q-gutter-sm items-end q-mb-lg">
        <h5 class="col-12 text-h6" style="margin-block: 3rem 0rem">
          Dagens strømpriser
        </h5>
        <q-select v-model="selectedArea" :options="areaOptions" label="Område" class="q-mb-sm col" emit-value
          map-options @update:model-value="fetchTodaysPrices" />
        <q-select v-model="selectedCity" :options="filteredCityOptions" label="By (valgfritt)" class="q-mb-sm col"
          emit-value map-options :disable="!selectedArea" @update:model-value="fetchTodaysPrices" />
      </div>

      <!-- Price Chart for Today -->
      <div v-if="prices.length" class="q-mt-lg">
        <h5 class="q-mb-md">Prisutvikling i dag - {{ getDisplayCity() }}</h5>
        <div class="chart-container" style="position: relative; height: 400px; width: 100%">
          <canvas ref="chartCanvas" style="display: block; width: 100%; height: 100%"></canvas>
        </div>

        <!-- Price Summary -->
        <div class="q-mt-md">
          <div class="row q-gutter-md justify-center text-center">
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center" style="box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;">
                <q-card-section>
                  <div class="text-h6 text-green">{{ getMinPrice(prices).toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Laveste pris i dag</div>
                  <div class="text-caption">{{ getMinPriceTime(prices) }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center" style="box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;">
                <q-card-section>
                  <div class="text-h6 text-red">{{ getMaxPrice(prices).toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Høyeste pris i dag</div>
                  <div class="text-caption">{{ getMaxPriceTime(prices) }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center" style="box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;">
                <q-card-section>
                  <div class="text-h6 text-blue">
                    {{ getCurrentPrice(prices).toFixed(2) }} kr/kWh
                  </div>
                  <div class="text-subtitle2">Nåværende pris</div>
                  <div class="text-caption">Nå {{ new Date().getHours() }}:00</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center" style="box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;">
                <q-card-section>
                  <div class="text-h6 text-orange">{{ getAvgPrice(prices).toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Gjennomsnitt i dag</div>
                  <div class="text-caption">24 timer</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center" style="box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;">
                <q-card-section>
                  <div class="text-h6 text-purple-12">
                    {{ getPriceDifference(prices).toFixed(2) }} kr/kWh
                  </div>
                  <div class="text-subtitle2">Forskjell i dag</div>
                  <div class="text-caption">Høyeste - Laveste</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="q-mt-lg text-center">
          <h6 class="q-mb-md">Utforsk mer</h6>
          <div class="row q-gutter-md justify-center">
            <q-btn
              label="Se historikk"
              color="primary"
              :to="'/history'"
              icon="history"
              no-caps
            />
            <q-btn
              label="Sett opp varsler"
              color="secondary"
              :to="'/notifications'"
              icon="notifications"
              no-caps
            />
          </div>
        </div>
      </div>

      <!-- Simple table showing today's prices -->
      <q-table
        class="q-mt-lg"
        v-if="prices.length"
        :rows="prices"
        :columns="simplifiedColumns"
        row-key="time_start"
        flat
        bordered
        :pagination="{ rowsPerPage: 12 }"
        title="Dagens timespriser"
      />
    </main>
  </q-page>
  <footer class="text-center">
    <FooterSection />
  </footer>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import FooterSection from 'src/components/FooterSection.vue';
import NavSection from 'src/components/NavSection.vue';
import { useTableServices, type Price, baseCities } from 'src/components/Index/TableScript';
import { useChartServices } from 'src/components/Index/ChartScript';

// Quasar instance for dark mode management
const $q = useQuasar();

// Reactive state variables - simplified for today only
const selectedArea = ref('NO1');
const selectedCity = ref<string | null>(null);
const prices = ref<Price[]>([]);
const isTaxIncluded = ref(false);

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

// Function to fetch and set color mode from localStorage
function initializeColorMode() {
  const storedColorMode = localStorage.getItem('colorMode');

  if (storedColorMode === 'dark') {
    $q.dark.set(true);
  } else if (storedColorMode === 'light') {
    $q.dark.set(false);
  } else {
    // If no preference stored, use system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    $q.dark.set(prefersDark);

    // Store the detected preference
    localStorage.setItem('colorMode', prefersDark ? 'dark' : 'light');
  }
}

async function fetchTodaysPrices() {
  const storedTaxPreference = localStorage.getItem('isTaxIncluded');
  isTaxIncluded.value = storedTaxPreference === 'true';

  try {
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

    // Create chart after data is loaded and DOM is updated
    await nextTick();
    createChart(prices.value);
  } catch (err) {
    console.error('Could not fetch today\'s prices', err);
  }
}

onMounted(() => {
  // Initialize color mode from localStorage or system preference
  initializeColorMode();

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
