<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
      <h1 class="text-h3 text-center">Få notifikasjoner ved ønsket strømpris</h1>
    </header>

    <main>
      <div class="row q-gutter-lg justify-center">
        <!-- Price Alert Card -->
        <div class="col-md-5 col-sm-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="notifications" class="q-mr-sm" />
                Prisvarsel
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">
                Få varsel når strømprisen når en bestemt verdi
              </p>

              <q-form @submit="savePriceAlert" class="q-gutter-md">
                <q-select v-model="priceAlert.area" :options="areaOptions" label="Område" emit-value map-options
                  required />

                <q-select v-model="priceAlert.city" :options="filteredCityOptions" label="By (valgfritt)" emit-value
                  map-options clearable />

                <q-input v-model.number="priceAlert.targetPrice" type="number" step="0.01" label="Ønsket pris (kr/kWh)"
                  suffix="kr/kWh" required />

                <q-select v-model="priceAlert.condition" :options="conditionOptions" label="Varsel når prisen er"
                  emit-value map-options required />

                <div class="row items-center">
                  <q-toggle v-model="priceAlert.enabled" label="Aktiver prisvarsel" color="primary" />
                </div>

                <q-btn label="Lagre prisvarsel" type="submit" color="primary" icon="save" class="full-width" />
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Cheapest Hour Alert Card -->
        <div class="col-md-5 col-sm-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="schedule" class="q-mr-sm" />
                Billigste time-varsel
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">
                Få varsel når strømmen er billigst i løpet av dagen
              </p>

              <q-form @submit="saveCheapestAlert" class="q-gutter-md">
                <q-select v-model="cheapestAlert.area" :options="areaOptions" label="Område" emit-value map-options
                  required />

                <q-select v-model="cheapestAlert.city" :options="filteredCheapestCityOptions" label="By (valgfritt)"
                  emit-value map-options clearable />

                <q-select v-model="cheapestAlert.notificationTime" :options="timeOptions" label="Tidspunkt for varsel"
                  emit-value map-options required />

                <div class="row items-center">
                  <q-toggle v-model="cheapestAlert.enabled" label="Aktiver billigste time-varsel" color="primary" />
                </div>

                <q-btn label="Lagre billigste time-varsel" type="submit" color="secondary" icon="save"
                  class="full-width" />
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Active Notifications Section -->
      <div class="q-mt-xl">
        <h5 class="text-h5 q-mb-md text-center">Aktive varsler</h5>

        <div class="row q-gutter-md justify-center">
          <!-- Price Alerts -->
          <div class="col-md-4 col-sm-12 d-flex flex-column" v-if="savedPriceAlerts.length > 0">
            <q-card class="flex-grow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Prisvarsler</div>
                <q-list separator>
                  <q-item v-for="(alert, index) in savedPriceAlerts" :key="index">
                    <q-item-section>
                      <q-item-label>
                        {{ getDisplayLocation(alert.area, alert.city) }}
                      </q-item-label>
                      <q-item-label caption>
                        Varsel når prisen er {{ alert.condition }} {{ alert.targetPrice }} kr/kWh
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center q-gutter-sm">
                        <q-toggle v-model="alert.enabled" @update:model-value="updatePriceAlert(index)" />
                        <q-btn flat round icon="delete" color="negative" size="sm" @click="deletePriceAlert(index)" />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Cheapest Hour Alerts -->
          <div class="col-md-4 col-sm-12 d-flex flex-column" v-if="savedCheapestAlerts.length > 0">
            <q-card class="flex-grow-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Billigste time-varsler</div>
                <q-list separator>
                  <q-item v-for="(alert, index) in savedCheapestAlerts" :key="index">
                    <q-item-section>
                      <q-item-label>
                        {{ getDisplayLocation(alert.area, alert.city) }}
                      </q-item-label>
                      <q-item-label caption>
                        Daglig varsel kl. {{ alert.notificationTime }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center q-gutter-sm">
                        <q-toggle v-model="alert.enabled" @update:model-value="updateCheapestAlert(index)" />
                        <q-btn flat round icon="delete" color="negative" size="sm"
                          @click="deleteCheapestAlert(index)" />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- No Alerts Message -->
        <div v-if="savedPriceAlerts.length === 0 && savedCheapestAlerts.length === 0" class="text-center q-pa-xl">
          <q-icon name="notifications_off" size="4rem" class="text-grey-5" />
          <p class="text-h6 text-grey-5 q-mt-md">Ingen aktive varsler</p>
          <p class="text-body2 text-grey-6">Opprett ditt første varsel ovenfor</p>
        </div>
      </div>

    </main>

  </q-page>
  <footer class="text-center">
    <FooterSection />
  </footer>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import FooterSection from 'src/components/FooterSection.vue'
import NavSection from 'src/components/NavSection.vue'

const $q = useQuasar()

// Define interfaces
interface PriceAlert {
  area: string
  city?: string
  targetPrice: number
  condition: string
  enabled: boolean
}

interface CheapestAlert {
  area: string
  city?: string
  notificationTime: string
  enabled: boolean
}

// Reactive data
const priceAlert = ref<PriceAlert>({
  area: '',
  city: '',
  targetPrice: 0,
  condition: 'under',
  enabled: true
})

const cheapestAlert = ref<CheapestAlert>({
  area: '',
  city: '',
  notificationTime: '07:00',
  enabled: true
})

const savedPriceAlerts = ref<PriceAlert[]>([])
const savedCheapestAlerts = ref<CheapestAlert[]>([])

// Options data
const areaOptions = [
  { value: 'NO1', label: 'Øst-Norge' },
  { value: 'NO2', label: 'Sør-Norge' },
  { value: 'NO3', label: 'Midt-Norge' },
  { value: 'NO4', label: 'Nord-Norge' },
  { value: 'NO5', label: 'Vest-Norge' }
]

const cityOptions = [
  { value: 'Oslo', label: 'Oslo', area: 'NO1' },
  { value: 'Moss', label: 'Moss', area: 'NO1' },
  { value: 'Drammen', label: 'Drammen', area: 'NO1' },
  { value: 'Fredrikstad', label: 'Fredrikstad', area: 'NO1' },

  { value: 'Kristiansand', label: 'Kristiansand', area: 'NO2' },
  { value: 'Arendal', label: 'Arendal', area: 'NO2' },
  { value: 'Haugesund', label: 'Haugesund', area: 'NO2' },
  { value: 'Porsgrunn', label: 'Porsgrunn', area: 'NO2' },
  { value: 'Sandefjord', label: 'Sandefjord', area: 'NO2' },
  { value: 'Stavanger', label: 'Stavanger', area: 'NO2' },
  { value: 'Tonsberg', label: 'Tønsberg', area: 'NO2' },

  { value: 'Trondheim', label: 'Trondheim', area: 'NO3' },
  { value: 'Alesund', label: 'Ålesund', area: 'NO3' },

  { value: 'Tromsø', label: 'Tromsø', area: 'NO4' },
  { value: 'Bodo', label: 'Bodø', area: 'NO4' },

  { value: 'Bergen', label: 'Bergen', area: 'NO5' },
]


const conditionOptions = [
  { label: 'under', value: 'under' },
  { label: 'over', value: 'over' },
  { label: 'lik', value: 'equal' }
]

const timeOptions = [
  { label: '01:00', value: '01:00' },
  { label: '02:00', value: '02:00' },
  { label: '03:00', value: '03:00' },
  { label: '04:00', value: '04:00' },
  { label: '05:00', value: '05:00' },
  { label: '06:00', value: '06:00' },
  { label: '07:00', value: '07:00' },
  { label: '08:00', value: '08:00' },
  { label: '09:00', value: '09:00' },
  { label: '10:00', value: '10:00' },
  { label: '11:00', value: '11:00' },
  { label: '12:00', value: '12:00' },
  { label: '13:00', value: '13:00' },
  { label: '14:00', value: '14:00' },
  { label: '15:00', value: '15:00' },
  { label: '16:00', value: '16:00' },
  { label: '17:00', value: '17:00' },
  { label: '18:00', value: '18:00' },
  { label: '19:00', value: '19:00' },
  { label: '20:00', value: '20:00' },
  { label: '21:00', value: '21:00' },
  { label: '22:00', value: '22:00' },
  { label: '23:00', value: '23:00' },
  { label: '00:00', value: '00:00' },
]
// Computed properties
const filteredCityOptions = computed(() => {
  if (!priceAlert.value.area) return []
  return cityOptions.filter(city => city.area === priceAlert.value.area)
})

const filteredCheapestCityOptions = computed(() => {
  if (!cheapestAlert.value.area) return []
  return cityOptions.filter(city => city.area === cheapestAlert.value.area)
})

// Methods
const savePriceAlert = () => {
  if (!priceAlert.value.area || !priceAlert.value.targetPrice) {
    $q.notify({
      type: 'negative',
      message: 'Vennligst fyll ut alle påkrevde felt'
    })
    return
  }

  savedPriceAlerts.value.push({ ...priceAlert.value })
  savePriceAlertsToStorage()

  // Reset form
  priceAlert.value = {
    area: '',
    city: '',
    targetPrice: 0,
    condition: 'under',
    enabled: true
  }

  $q.notify({
    type: 'positive',
    message: 'Prisvarsel lagret!',
    caption: 'Du vil få varsel når betingelsene oppfylles'
  })
}

const saveCheapestAlert = () => {
  if (!cheapestAlert.value.area || !cheapestAlert.value.notificationTime) {
    $q.notify({
      type: 'negative',
      message: 'Vennligst fyll ut alle påkrevde felt'
    })
    return
  }

  savedCheapestAlerts.value.push({ ...cheapestAlert.value })
  saveCheapestAlertsToStorage()

  // Reset form
  cheapestAlert.value = {
    area: '',
    city: '',
    notificationTime: '07:00',
    enabled: true
  }

  $q.notify({
    type: 'positive',
    message: 'Billigste time-varsel lagret!',
    caption: 'Du vil få daglig varsel om billigste time'
  })
}

const updatePriceAlert = (index: number) => {
  const alert = savedPriceAlerts.value[index]
  if (!alert) return

  savePriceAlertsToStorage()
  $q.notify({
    type: 'info',
    message: alert.enabled ? 'Prisvarsel aktivert' : 'Prisvarsel deaktivert'
  })
}

const updateCheapestAlert = (index: number) => {
  const alert = savedCheapestAlerts.value[index]
  if (!alert) return

  saveCheapestAlertsToStorage()
  $q.notify({
    type: 'info',
    message: alert.enabled ? 'Billigste time-varsel aktivert' : 'Billigste time-varsel deaktivert'
  })
}

const deletePriceAlert = (index: number) => {
  if (confirm('Er du sikker på at du vil slette dette prisvarselet?')) {
    savedPriceAlerts.value.splice(index, 1)
    savePriceAlertsToStorage()
    $q.notify({
      type: 'positive',
      message: 'Prisvarsel slettet'
    })
  }
}

const deleteCheapestAlert = (index: number) => {
  if (confirm('Er du sikker på at du vil slette dette varselet?')) {
    savedCheapestAlerts.value.splice(index, 1)
    saveCheapestAlertsToStorage()
    $q.notify({
      type: 'positive',
      message: 'Billigste time-varsel slettet'
    })
  }
}

const getDisplayLocation = (area: string, city?: string) => {
  if (city) {
    return city
  }

  const areaOption = areaOptions.find(option => option.value === area)
  return areaOption ? areaOption.label : area
}

// Storage methods
const savePriceAlertsToStorage = () => {
  localStorage.setItem('varsel-price-alerts', JSON.stringify(savedPriceAlerts.value))
}

const saveCheapestAlertsToStorage = () => {
  localStorage.setItem('varsel-cheapest-alerts', JSON.stringify(savedCheapestAlerts.value))
}

const loadPriceAlertsFromStorage = () => {
  const stored = localStorage.getItem('varsel-price-alerts')
  if (stored) {
    try {
      savedPriceAlerts.value = JSON.parse(stored)
    } catch (error) {
      console.error('Error loading price alerts from storage:', error)
    }
  }
}

const loadCheapestAlertsFromStorage = () => {
  const stored = localStorage.getItem('varsel-cheapest-alerts')
  if (stored) {
    try {
      savedCheapestAlerts.value = JSON.parse(stored)
    } catch (error) {
      console.error('Error loading cheapest alerts from storage:', error)
    }
  }
}

// Lifecycle
onMounted(() => {
  loadPriceAlertsFromStorage()
  loadCheapestAlertsFromStorage()
})
</script>

<style scoped>
.q-card {
  min-height: 400px;
}

.q-card .text-h6 {
  color: var(--q-primary);
  font-weight: 600;
}

.q-form .q-btn {
  margin-top: 1rem;
}

.q-item {
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.q-item:hover {
  background-color: var(--q-grey-1);
}

h5 {
  color: var(--q-dark);
  font-weight: 600;
}
</style>
