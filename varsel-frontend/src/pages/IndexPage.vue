<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
      <HeaderSection />
    </header>
    <main>
      <q-form @submit="fetchPrices">
        <q-select v-model="selectedArea" :options="areaOptions" label="Område" class="q-mb-sm" emit-value map-options @update:model-value="fetchPrices" />
        <q-select v-model="selectedCity" :options="filteredCityOptions" label="By (valgfritt)" class="q-mb-sm" emit-value
          map-options :disable="!selectedArea" @update:model-value="fetchPrices" @submit="fetchPrices" />
        <q-input v-model="date" label="Dato" type="date" class="q-mb-sm" @change="fetchPrices" />
        <q-input v-model="startHour" label="Starttid (valgfritt)" type="number" class="q-mb-sm" @change="fetchPrices" />
        <q-input v-model="endHour" label="Sluttid (valgfritt)" type="number" class="q-mb-sm" @change="fetchPrices" />
        <q-btn label="Fjern valgfrie" type="button" color="primary" @click="clearFilters" />
      </q-form>

      <!-- Price Chart -->
      <div v-if="prices.length" class="q-mt-lg">
        <h5 class="q-mb-md">Prisutvikling i {{ getDisplayCity() }}</h5>
        <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
          <canvas ref="chartCanvas" style="display: block; width: 100%; height: 100%;"></canvas>
        </div>

        <!-- Price Summary -->
        <div class="q-mt-md">
          <div class="row q-gutter-md justify-center text-center">
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-green">{{ getMinPrice(prices).toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Laveste pris</div>
                  <div class="text-caption">{{ getMinPriceTime(prices) }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-red">{{ getMaxPrice(prices).toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Høyeste pris</div>
                  <div class="text-caption">{{ getMaxPriceTime(prices) }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-orange">{{ getAvgPrice(prices).toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Gjennomsnitt</div>
                  <div class="text-caption">{{ prices.length }} timer</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-blue">{{ getPriceDifference(prices).toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Forskjell</div>
                  <div class="text-caption">Høyeste - Laveste</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <q-table class="q-mt-lg" v-if="prices.length" :rows="prices" :columns="columns" row-key="time_start" flat bordered />
    </main>
  </q-page>
  <footer class="text-center">
    <FooterSection />
  </footer>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted} from 'vue'
import { api } from 'boot/axios'
import FooterSection from 'src/components/FooterSection.vue'
import HeaderSection from 'src/components/HeaderSection.vue'
import NavSection from 'src/components/NavSection.vue'
import { useTableServices, type Price, baseCities } from 'src/components/Index/TableScript'
import { useChartServices } from 'src/components/Index/ChartScript'

// Reactive state variables
const selectedArea = ref('NO1')
const selectedCity = ref<string | null>(null)
const date = ref(new Date().toISOString().slice(0, 10))
const startHour = ref<number | null>(null)
const endHour = ref<number | null>(null)
const prices = ref<Price[]>([])
const isTaxIncluded = ref(false)

// Use table services
const {
  areaOptions,
  columns,
  filteredCityOptions,
  getMinPrice,
  getMaxPrice,
  getAvgPrice,
  getPriceDifference,
  getMinPriceTime,
  getMaxPriceTime
} = useTableServices(selectedArea)

// Use chart services
const { chartCanvas, createChart } = useChartServices()

async function fetchPrices() {
  const storedTaxPreference = localStorage.getItem('isTaxIncluded');
  isTaxIncluded.value = storedTaxPreference === 'true';

  try {
    // Use city if chosen, else use area
    const regionParam = selectedCity.value || selectedArea.value;
    const url = `/prices/${regionParam}/${date.value}`;

    // Build query parames dynamically with standard values
    const params: Record<string, number> = {
      startHour: startHour.value ?? 0, // Standard 0 if null
      endHour: endHour.value ?? 24    // Standard 24 if null
    };

    // Send GET-call to backend
    const response = await api.get(url, { params });

    // If reponse is string (from Java), parse it
    const json = typeof response.data === 'string'
      ? JSON.parse(response.data)
      : response.data;

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
        date: date.value
      };
    });

    prices.value = enrichedPrices;

    // Create chart after data is loaded and DOM is updated
    await nextTick();
    createChart(prices.value);
  } catch (err) {
    console.error('Could not fetch prices', err);
  }
}

// Watch for changes in selectedArea to reset city selection
watch(selectedArea, () => {
  selectedCity.value = null;
});

onMounted(() => {
  // Fetch prices on initial load
  void fetchPrices();
});

// Function to get the display city name
function getDisplayCity(): string {
  if (selectedCity.value) {
    // Find the selected city in cityOptions to get its label
    const cityOption = filteredCityOptions.value.find(city => city.value === selectedCity.value);
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
  return fetchPrices();
}
</script>
