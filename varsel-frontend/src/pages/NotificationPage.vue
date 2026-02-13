<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>

    <main>
      <HeroSection
        title="Smarte prisvarsler"
        description="Få beskjed når strømmen er billig eller når prisen endrer seg"
      />

      <div class="row q-gutter-xl justify-center q-mb-xl">
        <div class="col-12 col-md-5">
          <q-card class="alert-setup-card glass-card">
            <q-card-section>
              <div class="card-header q-mb-md">
                <div class="icon-wrapper primary-icon">
                  <q-icon name="notifications_active" size="lg" />
                </div>
                <div class="q-mb-lg">
                  <h3 class="text-h6 q-mb-xs">Prisvarsel</h3>
                  <p class="text-body2 text-grey-7">
                    Få varsel når strømprisen når en bestemt verdi
                  </p>
                </div>
              </div>

              <q-form @submit="savePriceAlert" class="q-gutter-md">
                <q-select
                  v-model="priceAlert.area"
                  :options="areaOptions"
                  label="Område"
                  emit-value
                  map-options
                  filled
                  standout
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" />
                  </template>
                </q-select>

                <q-select
                  v-model="priceAlert.city"
                  :options="filteredCityOptions"
                  label="By (valgfritt)"
                  emit-value
                  map-options
                  clearable
                  filled
                  standout
                >
                  <template v-slot:prepend>
                    <q-icon name="apartment" />
                  </template>
                </q-select>

                <q-input
                  v-model.number="priceAlert.targetPrice"
                  type="number"
                  step="0.01"
                  label="Ønsket pris (kr/kWh)"
                  suffix="kr/kWh"
                  filled
                  standout
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="payments" />
                  </template>
                </q-input>

                <q-select
                  v-model="priceAlert.condition"
                  :options="conditionOptions"
                  label="Varsel når prisen er"
                  emit-value
                  map-options
                  filled
                  standout
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="compare_arrows" />
                  </template>
                </q-select>

                <div class="toggle-wrapper">
                  <q-toggle
                    v-model="priceAlert.enabled"
                    label="Aktiver prisvarsel"
                    color="primary"
                    size="lg"
                  />
                </div>

                <q-btn
                  label="Lagre prisvarsel"
                  type="submit"
                  color="primary"
                  icon="save"
                  class="half-width"
                  unelevated
                  size="md"
                  no-caps
                />
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card class="alert-setup-card glass-card">
            <q-card-section>
              <div class="card-header q-mb-md">
                <div class="icon-wrapper secondary-icon">
                  <q-icon name="schedule" size="lg" />
                </div>
                <div class="q-mb-lg">
                  <h3 class="text-h6 q-mb-xs">Billigste time-varsel</h3>
                  <p class="text-body2 text-grey-7">
                    Få varsel når strømmen er billigst i løpet av dagen
                  </p>
                </div>
              </div>

              <q-form @submit="saveCheapestAlert" class="q-gutter-md">
                <q-select
                  v-model="cheapestAlert.area"
                  :options="areaOptions"
                  label="Område"
                  emit-value
                  map-options
                  filled
                  standout
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" />
                  </template>
                </q-select>

                <q-select
                  v-model="cheapestAlert.city"
                  :options="filteredCheapestCityOptions"
                  label="By (valgfritt)"
                  emit-value
                  map-options
                  clearable
                  filled
                  standout
                >
                  <template v-slot:prepend>
                    <q-icon name="apartment" />
                  </template>
                </q-select>

                <q-select
                  v-model="cheapestAlert.notificationTime"
                  :options="timeOptions"
                  label="Tidspunkt for varsel"
                  emit-value
                  map-options
                  filled
                  standout
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="access_time" />
                  </template>
                </q-select>

                <div class="toggle-wrapper">
                  <q-toggle
                    v-model="cheapestAlert.enabled"
                    label="Aktiver billigste time-varsel"
                    color="primary"
                    size="lg"
                  />
                </div>

                <q-btn
                  label="Lagre billigste time-varsel"
                  type="submit"
                  color="secondary"
                  icon="save"
                  class="half-width"
                  size="md"
                  no-caps
                />
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="active-alerts-section">
        <h2 class="text-h5 q-mb-lg text-center">
          <q-icon name="notifications" class="q-mr-sm" />
          Aktive varsler
        </h2>

        <div class="row q-gutter-lg justify-center">
          <div class="col-12 col-md-5" v-if="savedPriceAlerts.length > 0">
            <q-card class="active-alerts-card glass-card">
              <q-card-section>
                <div class="card-title q-mb-md">
                  <q-icon name="notifications_active" size="md" color="primary" />
                  <h3 class="text-h6">Prisvarsler</h3>
                </div>
                <q-list class="alerts-list">
                  <q-item
                    v-for="(alert, index) in savedPriceAlerts"
                    :key="index"
                    class="alert-item"
                  >
                    <q-item-section>
                      <q-item-label class="alert-location">
                        <q-icon name="place" size="xs" class="q-mr-xs" />
                        {{ getDisplayLocation(alert.area, alert.city) }}
                      </q-item-label>
                      <q-item-label caption class="alert-details">
                        <q-icon name="trending_flat" size="xs" class="q-mr-xs" />
                        Varsel når prisen er {{ alert.condition }} {{ alert.targetPrice }} kr/kWh
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="alert-controls">
                      <div class="row items-center q-gutter-sm no-wrap">
                        <q-toggle
                          v-model="alert.enabled"
                          @update:model-value="updatePriceAlert(index)"
                          color="primary"
                          dense
                        />
                        <q-btn
                          flat
                          round
                          icon="delete"
                          color="negative"
                          size="sm"
                          @click="deletePriceAlert(index)"
                        >
                          <q-tooltip>Slett varsel</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-5" v-if="savedCheapestAlerts.length > 0">
            <q-card class="active-alerts-card glass-card">
              <q-card-section>
                <div class="card-title q-mb-md">
                  <q-icon name="schedule" size="md" color="secondary" />
                  <h3 class="text-h6">Billigste time-varsler</h3>
                </div>
                <q-list class="alerts-list">
                  <q-item
                    v-for="(alert, index) in savedCheapestAlerts"
                    :key="index"
                    class="alert-item"
                  >
                    <q-item-section>
                      <q-item-label class="alert-location">
                        <q-icon name="place" size="xs" class="q-mr-xs" />
                        {{ getDisplayLocation(alert.area, alert.city) }}
                      </q-item-label>
                      <q-item-label caption class="alert-details">
                        <q-icon name="access_time" size="xs" class="q-mr-xs" />
                        Daglig varsel kl. {{ alert.notificationTime }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="alert-controls">
                      <div class="row items-center q-gutter-sm no-wrap">
                        <q-toggle
                          v-model="alert.enabled"
                          @update:model-value="updateCheapestAlert(index)"
                          color="primary"
                          dense
                        />
                        <q-btn
                          flat
                          round
                          icon="delete"
                          color="negative"
                          size="sm"
                          @click="deleteCheapestAlert(index)"
                        >
                          <q-tooltip>Slett varsel</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div
          v-if="savedPriceAlerts.length === 0 && savedCheapestAlerts.length === 0"
          class="no-alerts-message"
        >
          <q-card class="glass-card text-center">
            <q-card-section class="q-pa-xl">
              <q-icon name="notifications_off" size="80px" class="text-grey-5 q-mb-md" />
              <h3 class="text-h5 text-grey-5 q-mb-sm">Ingen aktive varsler</h3>
              <p class="text-body2 text-grey-6">
                Opprett ditt første varsel ovenfor for å komme i gang
              </p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </main>

    <footer class="q-mt-xl q-pb-lg">
      <FooterSection />
    </footer>
  </q-page>
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

.alert-setup-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    flex-shrink: 0;

    &.primary-icon {
      background: #00d9c0;
      color: white;
    }

    &.secondary-icon {
      background: #6366f1;
      color: white;
    }
  }

  h3 {
    margin: 0;
    font-weight: 700;
  }

  p {
    margin: 0;
  }
}

.toggle-wrapper {
  padding: 0.5rem 0;
}

.active-alerts-section {
  margin-top: 4rem;

  h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }
}

.active-alerts-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    h3 {
      margin: 0;
      font-weight: 600;
    }
  }

  .alerts-list {
    .alert-item {
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 0.5rem;
      background: rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 217, 192, 0.08);
      }

      .alert-location {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }

      .alert-details {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        opacity: 0.8;
      }

      .alert-controls {
        margin-left: 1rem;
      }
    }
  }
}

.body--dark {
  .alerts-list .alert-item {
    background: rgba(255, 255, 255, 0.05);

    &:hover {
      background: rgba(0, 217, 192, 0.1);
    }
  }
}

.no-alerts-message {
  max-width: 600px;
  margin: 2rem auto 0;

  .q-icon {
    opacity: 0.3;
  }
}

@media (max-width: 768px) {
  :deep(.hero-section) {
    padding: 1rem 0;

    .text-h4 {
      font-size: 1.75rem;
    }
  }

  .alert-setup-card .card-header {
    flex-direction: column;
    text-align: center;

    .icon-wrapper {
      margin: 0 auto;
    }
  }

  .active-alerts-card .alerts-list .alert-item {
    flex-direction: column;
    gap: 1rem;

    .alert-controls {
      margin-left: 0;
      align-self: stretch;
      justify-content: space-between;
    }
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import FooterSection from 'src/components/FooterSection.vue';
import HeroSection from 'src/components/HeroSection.vue';
import NavSection from 'src/components/NavSection.vue';

const $q = useQuasar();

// Define interfaces
interface PriceAlert {
  area: string;
  city?: string;
  targetPrice: number;
  condition: string;
  enabled: boolean;
}

interface CheapestAlert {
  area: string;
  city?: string;
  notificationTime: string;
  enabled: boolean;
}

// Reactive data
const priceAlert = ref<PriceAlert>({
  area: '',
  city: '',
  targetPrice: 0,
  condition: 'under',
  enabled: true,
});

const cheapestAlert = ref<CheapestAlert>({
  area: '',
  city: '',
  notificationTime: '07:00',
  enabled: true,
});

const savedPriceAlerts = ref<PriceAlert[]>([]);
const savedCheapestAlerts = ref<CheapestAlert[]>([]);

// Options data
const areaOptions = [
  { value: 'NO1', label: 'Øst-Norge' },
  { value: 'NO2', label: 'Sør-Norge' },
  { value: 'NO3', label: 'Midt-Norge' },
  { value: 'NO4', label: 'Nord-Norge' },
  { value: 'NO5', label: 'Vest-Norge' },
];

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
];

const conditionOptions = [
  { label: 'under', value: 'under' },
  { label: 'over', value: 'over' },
  { label: 'lik', value: 'equal' },
];

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
];
// Computed properties
const filteredCityOptions = computed(() => {
  if (!priceAlert.value.area) return [];
  return cityOptions.filter((city) => city.area === priceAlert.value.area);
});

const filteredCheapestCityOptions = computed(() => {
  if (!cheapestAlert.value.area) return [];
  return cityOptions.filter((city) => city.area === cheapestAlert.value.area);
});

// Methods
const savePriceAlert = () => {
  if (!priceAlert.value.area || !priceAlert.value.targetPrice) {
    $q.notify({
      type: 'negative',
      message: 'Vennligst fyll ut alle påkrevde felt',
    });
    return;
  }

  savedPriceAlerts.value.push({ ...priceAlert.value });
  savePriceAlertsToStorage();

  // Reset form
  priceAlert.value = {
    area: '',
    city: '',
    targetPrice: 0,
    condition: 'under',
    enabled: true,
  };

  $q.notify({
    type: 'positive',
    message: 'Prisvarsel lagret!',
    caption: 'Du vil få varsel når betingelsene oppfylles',
  });
};

const saveCheapestAlert = () => {
  if (!cheapestAlert.value.area || !cheapestAlert.value.notificationTime) {
    $q.notify({
      type: 'negative',
      message: 'Vennligst fyll ut alle påkrevde felt',
    });
    return;
  }

  savedCheapestAlerts.value.push({ ...cheapestAlert.value });
  saveCheapestAlertsToStorage();

  // Reset form
  cheapestAlert.value = {
    area: '',
    city: '',
    notificationTime: '07:00',
    enabled: true,
  };

  $q.notify({
    type: 'positive',
    message: 'Billigste time-varsel lagret!',
    caption: 'Du vil få daglig varsel om billigste time',
  });
};

const updatePriceAlert = (index: number) => {
  const alert = savedPriceAlerts.value[index];
  if (!alert) return;

  savePriceAlertsToStorage();
  $q.notify({
    type: 'info',
    message: alert.enabled ? 'Prisvarsel aktivert' : 'Prisvarsel deaktivert',
  });
};

const updateCheapestAlert = (index: number) => {
  const alert = savedCheapestAlerts.value[index];
  if (!alert) return;

  saveCheapestAlertsToStorage();
  $q.notify({
    type: 'info',
    message: alert.enabled ? 'Billigste time-varsel aktivert' : 'Billigste time-varsel deaktivert',
  });
};

const deletePriceAlert = (index: number) => {
  if (confirm('Er du sikker på at du vil slette dette prisvarselet?')) {
    savedPriceAlerts.value.splice(index, 1);
    savePriceAlertsToStorage();
    $q.notify({
      type: 'positive',
      message: 'Prisvarsel slettet',
    });
  }
};

const deleteCheapestAlert = (index: number) => {
  if (confirm('Er du sikker på at du vil slette dette varselet?')) {
    savedCheapestAlerts.value.splice(index, 1);
    saveCheapestAlertsToStorage();
    $q.notify({
      type: 'positive',
      message: 'Billigste time-varsel slettet',
    });
  }
};

const getDisplayLocation = (area: string, city?: string) => {
  if (city) {
    return city;
  }

  const areaOption = areaOptions.find((option) => option.value === area);
  return areaOption ? areaOption.label : area;
};

// Storage methods
const savePriceAlertsToStorage = () => {
  localStorage.setItem('varsel-price-alerts', JSON.stringify(savedPriceAlerts.value));
};

const saveCheapestAlertsToStorage = () => {
  localStorage.setItem('varsel-cheapest-alerts', JSON.stringify(savedCheapestAlerts.value));
};

const loadPriceAlertsFromStorage = () => {
  const stored = localStorage.getItem('varsel-price-alerts');
  if (stored) {
    try {
      savedPriceAlerts.value = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading price alerts from storage:', error);
    }
  }
};

const loadCheapestAlertsFromStorage = () => {
  const stored = localStorage.getItem('varsel-cheapest-alerts');
  if (stored) {
    try {
      savedCheapestAlerts.value = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading cheapest alerts from storage:', error);
    }
  }
};

// Lifecycle
onMounted(() => {
  loadPriceAlertsFromStorage();
  loadCheapestAlertsFromStorage();
});
</script>

<style scoped>
.q-card {
  min-height: 400px;
}

.q-card .text-h6 {
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
