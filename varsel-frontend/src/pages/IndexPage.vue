<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
      <HeaderSection />
    </header>
    <main>
      <q-form @submit="fetchPrices">
        <q-select v-model="selectedArea" :options="areaOptions" label="Område" class="q-mb-sm" emit-value map-options />
        <q-select v-model="selectedCity" :options="filteredCityOptions" label="By (valgfritt)" class="q-mb-sm" emit-value
          map-options :disable="!selectedArea" />
        <q-input v-model="date" label="Dato" type="date" class="q-mb-sm" />
        <q-input v-model="startHour" label="Starttid (valgfritt)" type="number" class="q-mb-sm" />
        <q-input v-model="endHour" label="Sluttid (valgfritt)" type="number" class="q-mb-sm" />
        <q-btn label="Hent priser" type="submit" color="primary" />
      </q-form>

      <!-- Price Chart -->
      <div v-if="prices.length" class="q-mt-lg">
        <h5 class="q-mb-md">Prisutvikling i {{ selectedArea }}</h5>
        <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
          <canvas ref="chartCanvas" style="display: block; width: 100%; height: 100%;"></canvas>
        </div>

        <!-- Price Summary -->
        <div class="q-mt-md">
          <div class="row q-gutter-md justify-center text-center">
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-green">{{ getMinPrice().toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Laveste pris</div>
                  <div class="text-caption">{{ getMinPriceTime() }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-red">{{ getMaxPrice().toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Høyeste pris</div>
                  <div class="text-caption">{{ getMaxPriceTime() }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-orange">{{ getAvgPrice().toFixed(2) }} kr/kWh</div>
                  <div class="text-subtitle2">Gjennomsnitt</div>
                  <div class="text-caption">{{ prices.length }} timer</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-card class="text-center">
                <q-card-section>
                  <div class="text-h6 text-blue">{{ getPriceDifference().toFixed(2) }} kr/kWh</div>
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
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import type { QTableColumn } from 'quasar'
import FooterSection from 'src/components/FooterSection.vue'
import HeaderSection from 'src/components/HeaderSection.vue'
import NavSection from 'src/components/NavSection.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Define options for area and city selection
const areaOptions = [
  { value: 'NO1', label: 'Øst-Norge' },
  { value: 'NO2', label: 'Sør-Norge' },
  { value: 'NO3', label: 'Midt-Norge' },
  { value: 'NO4', label: 'Nord-Norge' },
  { value: 'NO5', label: 'Vest-Norge' }
]

// Define specific cities with their areas
const cityOptions = [
  { value: '', label: 'Oslo', area: 'NO1' },
  { value: 'Moss', label: 'Moss', area: 'NO1' },
  { value: 'Drammen', label: 'Drammen', area: 'NO1' },
  { value: 'Fredrikstad', label: 'Fredrikstad', area: 'NO1' },

  { value: '', label: 'Kristiansand', area: 'NO2' },
  { value: 'Arendal', label: 'Arendal', area: 'NO2' },
  { value: 'Haugesund', label: 'Haugesund', area: 'NO2' },
  { value: 'Porsgrunn', label: 'Porsgrunn', area: 'NO2' },
  { value: 'Sandefjord', label: 'Sandefjord', area: 'NO2' },
  { value: 'Stavanger', label: 'Stavanger', area: 'NO2' },
  { value: 'Tonsberg', label: 'Tønsberg', area: 'NO2' },

  { value: '', label: 'Trondheim', area: 'NO3' },
  { value: 'Alesund', label: 'Ålesund', area: 'NO3' },

  { value: '', label: 'Tromsø', area: 'NO4' },
  { value: 'Bodo', label: 'Bodø', area: 'NO4' },

  { value: '', label: 'Bergen', area: 'NO5' },
]

// Base cities for each area, used for default selection
const baseCities: Record<'NO1' | 'NO2' | 'NO3' | 'NO4' | 'NO5', string> = {
  NO1: 'Oslo',
  NO2: 'Kristiansand',
  NO3: 'Trondheim',
  NO4: 'Tromsø',
  NO5: 'Bergen'
};


// Reactive state variables
const selectedArea = ref('NO1')
const selectedCity = ref(null)
const date = ref(new Date().toISOString().slice(0, 10))
const startHour = ref<number | null>(null)
const endHour = ref<number | null>(null)
const prices = ref<Price[]>([])
const isTaxIncluded = ref(false)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: ChartJS | null = null



const filteredCityOptions = computed(() =>
  cityOptions.filter(city => city.area === selectedArea.value)
)

// Define the columns for the QTable
const columns: QTableColumn[] = [
  {
    name: 'area',
    label: 'Område',
    field: row => areaOptions.find(option => option.value === row.area)?.label || row.area,
    align: 'left' as const
  },
  { name: 'city', label: 'By', field: 'city', align: 'left' as const },
  {
    name: 'date', label: 'Dato', field: row => {
      const [year, month, day] = row.date.split('-');
      return `${day}.${month}.${year}`; // DD.MM.YYYY format
    }, align: 'left' as const
  },
  { name: 'time_start', label: 'Start', field: row => row.time_start.slice(11, 16), align: 'left' as const }, // Only retrieves hour and minute
  { name: 'time_end', label: 'Slutt', field: row => row.time_end.slice(11, 16), align: 'left' as const }, // Only retrieves hour and minute
  { name: 'NOK_per_kWh', label: 'Pris (kr/kWh)', field: 'NOK_per_kWh', align: 'right' as const, format: (val: number) => `${val.toFixed(2)} kr` }
]

interface Price {
  time_start: string;
  time_end: string;
  NOK_per_kWh: number;
  area: string;
  city: string;
  date: string;
}

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
    createChart();
  } catch (err) {
    console.error('Could not fetch prices', err);
  }
}

// Watch for changes in selectedArea to reset city selection
watch(selectedArea, () => {
  selectedCity.value = null;
});

// Clean up chart on component unmount
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

// Helper functions for price statistics
function getMinPrice(): number {
  if (prices.value.length === 0) return 0;
  return Math.min(...prices.value.map(p => p.NOK_per_kWh));
}

function getMaxPrice(): number {
  if (prices.value.length === 0) return 0;
  return Math.max(...prices.value.map(p => p.NOK_per_kWh));
}

function getAvgPrice(): number {
  if (prices.value.length === 0) return 0;
  const sum = prices.value.reduce((acc, p) => acc + p.NOK_per_kWh, 0);
  return sum / prices.value.length;
}

function getPriceDifference(): number {
  return getMaxPrice() - getMinPrice();
}

function getMinPriceTime(): string {
  if (prices.value.length === 0) return '';
  const minPrice = getMinPrice();
  const minPriceData = prices.value.find(p => p.NOK_per_kWh === minPrice);
  return minPriceData ? minPriceData.time_start.slice(11, 16) : '';
}

function getMaxPriceTime(): string {
  if (prices.value.length === 0) return '';
  const maxPrice = getMaxPrice();
  const maxPriceData = prices.value.find(p => p.NOK_per_kWh === maxPrice);
  return maxPriceData ? maxPriceData.time_start.slice(11, 16) : '';
}


// Function to create the price chart
function createChart() {
  if (!chartCanvas.value || prices.value.length === 0) {
    return;
  }

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) {
    return;
  }

  const labels = prices.value.map(price => {
    const timeStr = price.time_start || '';
    return timeStr.length >= 16 ? timeStr.slice(11, 16) : timeStr;
  });
  const data = prices.value.map(price => typeof price.NOK_per_kWh === 'number' ? price.NOK_per_kWh : parseFloat(price.NOK_per_kWh) || 0);

  // Calculate min, max, and average
  const minPrice = Math.min(...data);
  const maxPrice = Math.max(...data);
  const avgPrice = data.reduce((sum, price) => sum + price, 0) / data.length;

  // Find indices of min and max prices
  const minIndex = data.indexOf(minPrice);
  const maxIndex = data.indexOf(maxPrice);

  try {
    chartInstance = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pris (kr/kWh)',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: true,
          pointBackgroundColor: data.map((price, index) => {
            if (index === minIndex) return 'green';
            if (index === maxIndex) return 'red';
            return 'rgb(75, 192, 192)';
          }),
          pointBorderColor: data.map((price, index) => {
            if (index === minIndex) return 'darkgreen';
            if (index === maxIndex) return 'darkred';
            return 'rgb(75, 192, 192)';
          }),
          pointRadius: data.map((price, index) => {
            if (index === minIndex || index === maxIndex) return 8;
            return 4;
          })
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Strømpriser gjennom dagen'
          },
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y.toFixed(2);
                let label = `Pris: ${value} kr/kWh`;

                if (context.dataIndex === minIndex) {
                  label += ' (Laveste)';
                } else if (context.dataIndex === maxIndex) {
                  label += ' (Høyeste)';
                }

                return label;
              }
            }
          },
          // @ts-expect-error - annotation plugin types may not be fully compatible
          annotation: {
            annotations: {
              averageLine: {
                type: 'line',
                yMin: avgPrice,
                yMax: avgPrice,
                borderColor: 'orange',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  content: `Gjennomsnitt: ${avgPrice.toFixed(2)} kr/kWh`,
                  enabled: true,
                  position: 'end',
                  backgroundColor: 'orange',
                  color: 'white',
                  padding: 4
                }
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Pris (kr/kWh)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tid'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating chart:', error);
  }
}
</script>
