<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>

    <main>
      <HeroSection
        :title="t('notifications.heroTitle')"
        :description="t('notifications.heroDescription')"
        class="q-py-xl"
      />

      <!-- Delivery only runs while a tab is open, and OS notifications need an
           explicit user gesture to request - this surfaces both facts instead
           of silently degrading to the in-app list below. -->
      <q-card class="engine-card glass-card q-mb-xl">
        <q-card-section class="engine-row">
          <div class="engine-icon" :class="`engine-icon--${permissionTone}`">
            <q-icon :name="permissionIcon" size="22px" aria-hidden="true" />
          </div>

          <div class="engine-copy">
            <p class="engine-message">{{ permissionMessage }}</p>
            <p v-if="isDegraded" class="engine-degraded">
              <q-icon name="sym_o_cloud_off" size="16px" aria-hidden="true" />
              {{ t('notifications.engine.degraded') }}
            </p>
          </div>

          <q-btn
            v-if="permission === 'default'"
            :label="t('notifications.engine.enableButton')"
            icon="sym_o_notifications_active"
            color="primary"
            unelevated
            no-caps
            size="sm"
            @click="enableNotifications"
          />
        </q-card-section>
      </q-card>

      <div class="row q-gutter-xl justify-center q-mb-xl">
        <div class="col-12 col-md-5">
          <q-card class="alert-setup-card glass-card">
            <q-card-section>
              <div class="card-header q-mb-md">
                <div class="icon-wrapper primary-icon">
                  <q-icon name="sym_o_notifications_active" size="28px" aria-hidden="true" />
                </div>
                <div class="q-mb-lg">
                  <h3 class="text-h6 q-mb-xs">{{ t('notifications.priceAlert.title') }}</h3>
                  <p class="text-body2 text-grey-7">
                    {{ t('notifications.priceAlert.description') }}
                  </p>
                </div>
              </div>

              <q-form @submit="savePriceAlert" class="q-gutter-md">
                <AppSelect
                  v-model="priceForm.area"
                  :options="areaOptions"
                  :label="t('notifications.priceAlert.area')"
                  icon="sym_o_location_on"
                />

                <AppSelect
                  v-model="priceForm.city"
                  :options="priceCityOptions"
                  :label="t('notifications.priceAlert.city')"
                  icon="sym_o_apartment"
                  :disable="!priceForm.area"
                  clearable
                />

                <q-input
                  v-model.number="priceForm.targetPrice"
                  type="number"
                  step="0.01"
                  :label="t('notifications.priceAlert.targetPrice')"
                  suffix="kr/kWh"
                  filled
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="sym_o_payments" size="20px" aria-hidden="true" />
                  </template>
                </q-input>

                <AppSelect
                  v-model="priceForm.condition"
                  :options="conditionOptions"
                  :label="t('notifications.priceAlert.condition')"
                  icon="sym_o_compare_arrows"
                />

                <AlertScheduleFields v-model:days="priceForm.days" v-model:quietHours="priceForm.quietHours" />

                <div class="toggle-wrapper">
                  <q-toggle
                    v-model="priceForm.enabled"
                    :label="t('notifications.priceAlert.enable')"
                    color="primary"
                    size="lg"
                  />
                </div>

                <q-btn
                  :label="t('notifications.priceAlert.save')"
                  type="submit"
                  color="primary"
                  icon="sym_o_save"
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
                  <q-icon name="sym_o_schedule" size="28px" aria-hidden="true" />
                </div>
                <div class="q-mb-lg">
                  <h3 class="text-h6 q-mb-xs">{{ t('notifications.cheapestAlert.title') }}</h3>
                  <p class="text-body2 text-grey-7">
                    {{ t('notifications.cheapestAlert.description') }}
                  </p>
                </div>
              </div>

              <q-form @submit="saveCheapestAlert" class="q-gutter-md">
                <AppSelect
                  v-model="cheapestForm.area"
                  :options="areaOptions"
                  :label="t('notifications.cheapestAlert.area')"
                  icon="sym_o_location_on"
                />

                <AppSelect
                  v-model="cheapestForm.city"
                  :options="cheapestCityOptions"
                  :label="t('notifications.cheapestAlert.city')"
                  icon="sym_o_apartment"
                  :disable="!cheapestForm.area"
                  clearable
                />

                <AppSelect
                  v-model="cheapestForm.notificationTime"
                  :options="notificationTimeOptions"
                  :label="t('notifications.cheapestAlert.notificationTime')"
                  icon="sym_o_schedule"
                />

                <AlertScheduleFields v-model:days="cheapestForm.days" v-model:quietHours="cheapestForm.quietHours" />

                <div class="toggle-wrapper">
                  <q-toggle
                    v-model="cheapestForm.enabled"
                    :label="t('notifications.cheapestAlert.enable')"
                    color="primary"
                    size="lg"
                  />
                </div>

                <q-btn
                  :label="t('notifications.cheapestAlert.save')"
                  type="submit"
                  color="secondary"
                  icon="sym_o_save"
                  class="half-width"
                  size="md"
                  no-caps
                />
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="active-alerts-section q-mt-xl">
        <h2 class="text-h5 q-mb-lg text-center">
          <q-icon name="sym_o_notifications" size="sm" class="q-mr-sm" aria-hidden="true" />
          {{ t('notifications.active.heading') }}
        </h2>

        <div class="row q-gutter-lg justify-center">
          <div class="col-12 col-md-5" v-if="priceAlerts.length > 0">
            <q-card class="active-alerts-card glass-card">
              <q-card-section>
                <div class="card-title q-mb-md">
                  <q-icon name="sym_o_notifications_active" size="sm" color="primary" aria-hidden="true" />
                  <h3 class="text-h6">{{ t('notifications.active.priceAlertsTitle') }}</h3>
                </div>
                <q-list class="alerts-list">
                  <q-item v-for="alert in priceAlerts" :key="alert.id" class="alert-item">
                    <q-item-section>
                      <q-item-label class="alert-location">
                        <q-icon name="sym_o_location_on" size="16px" class="q-mr-xs" aria-hidden="true" />
                        {{ getDisplayLocation(alert) }}
                      </q-item-label>
                      <q-item-label caption class="alert-details">
                        <q-icon name="sym_o_trending_flat" size="16px" class="q-mr-xs" aria-hidden="true" />
                        {{ t('notifications.active.priceAlertDetail', { condition: getConditionLabel(alert.condition), price: alert.targetPrice }) }}
                      </q-item-label>
                      <q-item-label caption class="alert-schedule">
                        <q-icon name="sym_o_calendar_month" size="16px" class="q-mr-xs" aria-hidden="true" />
                        {{ scheduleSummary(alert) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="alert-controls">
                      <div class="row items-center q-gutter-sm no-wrap">
                        <q-toggle
                          v-model="alert.enabled"
                          @update:model-value="toggleAlert(alert)"
                          color="primary"
                          dense
                        />
                        <q-btn
                          flat
                          round
                          icon="sym_o_delete"
                          color="negative"
                          size="md"
                          :aria-label="t('notifications.active.deleteTooltip')"
                          @click="deleteAlert(alert)"
                        >
                          <q-tooltip>{{ t('notifications.active.deleteTooltip') }}</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-5" v-if="cheapestAlerts.length > 0">
            <q-card class="active-alerts-card glass-card">
              <q-card-section>
                <div class="card-title q-mb-md">
                  <q-icon name="sym_o_schedule" size="sm" color="secondary" aria-hidden="true" />
                  <h3 class="text-h6">{{ t('notifications.active.cheapestAlertsTitle') }}</h3>
                </div>
                <q-list class="alerts-list">
                  <q-item v-for="alert in cheapestAlerts" :key="alert.id" class="alert-item">
                    <q-item-section>
                      <q-item-label class="alert-location">
                        <q-icon name="sym_o_location_on" size="16px" class="q-mr-xs" aria-hidden="true" />
                        {{ getDisplayLocation(alert) }}
                      </q-item-label>
                      <q-item-label caption class="alert-details">
                        <q-icon name="sym_o_schedule" size="16px" class="q-mr-xs" aria-hidden="true" />
                        {{ t('notifications.active.cheapestAlertDetail', { time: alert.notificationTime }) }}
                      </q-item-label>
                      <q-item-label caption class="alert-schedule">
                        <q-icon name="sym_o_calendar_month" size="16px" class="q-mr-xs" aria-hidden="true" />
                        {{ scheduleSummary(alert) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="alert-controls">
                      <div class="row items-center q-gutter-sm no-wrap">
                        <q-toggle
                          v-model="alert.enabled"
                          @update:model-value="toggleAlert(alert)"
                          color="primary"
                          dense
                        />
                        <q-btn
                          flat
                          round
                          icon="sym_o_delete"
                          color="negative"
                          size="md"
                          :aria-label="t('notifications.active.deleteTooltip')"
                          @click="deleteAlert(alert)"
                        >
                          <q-tooltip>{{ t('notifications.active.deleteTooltip') }}</q-tooltip>
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
          v-if="priceAlerts.length === 0 && cheapestAlerts.length === 0"
          class="no-alerts-message q-mx-auto q-mt-xl text-center"
        >
          <q-card class="glass-card text-center">
            <q-card-section class="q-pa-xl">
              <div class="empty-badge q-mb-md">
                <q-icon name="sym_o_notifications_off" size="32px" aria-hidden="true" />
              </div>
              <h3 class="text-h5 text-grey-5 q-mb-sm">{{ t('notifications.active.emptyTitle') }}</h3>
              <p class="text-body2 text-grey-6">
                {{ t('notifications.active.emptyDescription') }}
              </p>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="recent-section q-mt-xl">
        <h2 class="text-h5 q-mb-lg text-center">
          <q-icon name="sym_o_history" size="sm" class="q-mr-sm" aria-hidden="true" />
          {{ t('notifications.recent.heading') }}
        </h2>

        <q-card class="recent-card glass-card q-mx-auto">
          <q-card-section v-if="recentDeliveries.length === 0" class="recent-empty">
            <q-icon name="sym_o_notifications" size="28px" aria-hidden="true" />
            <p>{{ t('notifications.recent.empty') }}</p>
          </q-card-section>

          <q-list v-else separator>
            <q-item v-for="event in recentDeliveries" :key="`${event.key}-${event.at}`">
              <q-item-section avatar>
                <q-icon
                  :name="outcomeIcon(event.outcome)"
                  :color="outcomeColor(event.outcome)"
                  size="20px"
                  aria-hidden="true"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ event.body }}</q-item-label>
                <q-item-label caption>
                  {{ outcomeLabel(event.outcome) }} &bull; {{ formatEventTime(event.at) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
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
}

.engine-card {
  max-width: 900px;
  margin: 0 auto;
}

.engine-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.engine-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;

  &--primary {
    background: color-mix(in srgb, var(--q-primary) 16%, transparent);
    color: var(--q-primary);
  }

  &--positive {
    background: color-mix(in srgb, $positive 16%, transparent);
    color: $positive;
  }

  &--muted {
    background: var(--surface);
    color: var(--text-subtle);
  }
}

.engine-copy {
  flex: 1;
  min-width: 200px;
}

.engine-message {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.engine-degraded {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: $warning;
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
      background: var(--q-primary);
      color: white;
    }

    &.secondary-icon {
      background: $secondary;
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

.active-alerts-section,
.recent-section {
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
      background: rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;

      &:hover {
        background: color-mix(in srgb, var(--q-primary) 8%, transparent);
      }

      .alert-location {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 1rem;
      }

      .alert-details,
      .alert-schedule {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        opacity: 0.8;
      }

      .alert-schedule {
        margin-top: 0.125rem;
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
      background: color-mix(in srgb, var(--q-primary) 10%, transparent);
    }
  }
}

.empty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-subtle);
}

.recent-card {
  max-width: 900px;
  margin: 0 auto;
}

.recent-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--text-muted);

  p {
    margin: 0;
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
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

<style scoped>
.q-card {
  min-height: 400px;
}

.engine-card,
.recent-card {
  min-height: 0;
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import AlertScheduleFields from 'src/components/AlertScheduleFields.vue';
import AppSelect from 'src/components/AppSelect.vue';
import FooterSection from 'src/components/FooterSection.vue';
import HeroSection from 'src/components/HeroSection.vue';
import NavSection from 'src/components/NavSection.vue';
import { useAlertEngine, type DeliveryEvent } from 'src/composables/useAlertEngine';
import { formatMinutesOfDay, getOsloParts, timeOfDayOptions, type WeekdayIndex } from 'src/scripts/osloTime';
import { baseCities, cityOptions, useAreaOptions } from 'src/scripts/TableScript';
import {
  createCheapestAlert,
  createPriceAlert,
  defaultQuietHours,
  loadAlerts,
  saveAlerts,
  type Alert,
  type CheapestAlert,
  type DeliveryOutcome,
  type PriceAlert,
  type PriceCondition,
  type QuietHours,
} from 'src/scripts/alertStore';

const $q = useQuasar();
const { t } = useI18n();
const { permission, isDegraded, recentDeliveries, requestPermission, runOnce } = useAlertEngine();

/* ------------------------------------------------------------------ *
 * Alerts (unified store)
 * ------------------------------------------------------------------ */

const alerts = ref<Alert[]>(loadAlerts());

const priceAlerts = computed(() => alerts.value.filter((alert): alert is PriceAlert => alert.kind === 'price'));
const cheapestAlerts = computed(() =>
  alerts.value.filter((alert): alert is CheapestAlert => alert.kind === 'cheapest'),
);

// Persists to storage and asks the engine to re-evaluate immediately, so
// creating/toggling an alert reflects in "recent activity" without waiting
// for the next 60s tick.
function persist() {
  saveAlerts(alerts.value);
  void runOnce({ force: true });
}

/* ------------------------------------------------------------------ *
 * Options shared with the price pages
 * ------------------------------------------------------------------ */

const areaOptions = useAreaOptions();
const priceCityOptions = computed(() => cityOptions.filter((city) => city.area === priceForm.value.area));
const cheapestCityOptions = computed(() => cityOptions.filter((city) => city.area === cheapestForm.value.area));

const conditionOptions = computed(() => [
  { label: t('notifications.priceAlert.conditionUnder'), value: 'under' },
  { label: t('notifications.priceAlert.conditionOver'), value: 'over' },
  { label: t('notifications.priceAlert.conditionEqual'), value: 'equal' },
]);

function getConditionLabel(value: PriceCondition): string {
  return conditionOptions.value.find((option) => option.value === value)?.label ?? value;
}

// Half-hour granularity, matching the quiet-hours picker in AlertScheduleFields.
const notificationTimeOptions = timeOfDayOptions(30).map(({ label }) => ({ label, value: label }));

/* ------------------------------------------------------------------ *
 * Creation forms
 * ------------------------------------------------------------------ */

interface PriceFormState {
  area: string;
  city: string;
  targetPrice: number | null;
  condition: PriceCondition;
  enabled: boolean;
  days: WeekdayIndex[];
  quietHours: QuietHours;
}

interface CheapestFormState {
  area: string;
  city: string;
  notificationTime: string;
  enabled: boolean;
  days: WeekdayIndex[];
  quietHours: QuietHours;
}

function emptyPriceForm(): PriceFormState {
  return {
    area: '',
    city: '',
    targetPrice: null,
    condition: 'under',
    enabled: true,
    days: [],
    quietHours: defaultQuietHours(),
  };
}

function emptyCheapestForm(): CheapestFormState {
  return {
    area: '',
    city: '',
    notificationTime: '07:00',
    enabled: true,
    days: [],
    quietHours: defaultQuietHours(),
  };
}

const priceForm = ref<PriceFormState>(emptyPriceForm());
const cheapestForm = ref<CheapestFormState>(emptyCheapestForm());

function savePriceAlert() {
  const { area, city, targetPrice, condition, enabled, days, quietHours } = priceForm.value;
  if (!area || targetPrice === null || Number.isNaN(targetPrice)) {
    $q.notify({ type: 'negative', message: t('notifications.notify.validationError') });
    return;
  }

  const alert = createPriceAlert({ area, city, targetPrice, condition, enabled, days, quietHours });
  alerts.value = [...alerts.value, alert];
  persist();
  priceForm.value = emptyPriceForm();

  $q.notify({
    type: 'positive',
    message: t('notifications.notify.priceAlertSaved'),
    caption: t('notifications.notify.priceAlertSavedCaption'),
  });
}

function saveCheapestAlert() {
  const { area, city, notificationTime, enabled, days, quietHours } = cheapestForm.value;
  if (!area || !notificationTime) {
    $q.notify({ type: 'negative', message: t('notifications.notify.validationError') });
    return;
  }

  const alert = createCheapestAlert({ area, city, notificationTime, enabled, days, quietHours });
  alerts.value = [...alerts.value, alert];
  persist();
  cheapestForm.value = emptyCheapestForm();

  $q.notify({
    type: 'positive',
    message: t('notifications.notify.cheapestAlertSaved'),
    caption: t('notifications.notify.cheapestAlertSavedCaption'),
  });
}

function toggleAlert(alert: Alert) {
  persist();
  const key =
    alert.kind === 'price'
      ? alert.enabled
        ? 'notifications.notify.priceAlertEnabled'
        : 'notifications.notify.priceAlertDisabled'
      : alert.enabled
        ? 'notifications.notify.cheapestAlertEnabled'
        : 'notifications.notify.cheapestAlertDisabled';
  $q.notify({ type: 'info', message: t(key) });
}

function deleteAlert(alert: Alert) {
  const confirmKey =
    alert.kind === 'price'
      ? 'notifications.notify.confirmDeletePriceAlert'
      : 'notifications.notify.confirmDeleteCheapestAlert';
  if (!confirm(t(confirmKey))) return;

  // Filtered by stable id, not array index - an earlier deletion can no
  // longer re-point a later alert's toggle/delete at the wrong entry.
  alerts.value = alerts.value.filter((existing) => existing.id !== alert.id);
  persist();

  const doneKey =
    alert.kind === 'price' ? 'notifications.notify.priceAlertDeleted' : 'notifications.notify.cheapestAlertDeleted';
  $q.notify({ type: 'positive', message: t(doneKey) });
}

/* ------------------------------------------------------------------ *
 * Display helpers
 * ------------------------------------------------------------------ */

function getDisplayLocation(alert: Pick<Alert, 'area' | 'city'>): string {
  if (alert.city) {
    const match = cityOptions.find((option) => option.area === alert.area && option.value === alert.city);
    return match ? match.label : alert.city;
  }
  return baseCities[alert.area as keyof typeof baseCities] ?? alert.area;
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function scheduleSummary(alert: Alert): string {
  const daysPart =
    alert.days.length === 0
      ? t('notifications.active.scheduleEveryDay')
      : alert.days.map((day) => t(`notifications.weekdaysShort.${WEEKDAY_KEYS[day]}`)).join(', ');

  if (!alert.quietHours.enabled) return daysPart;

  const quietPart = t('notifications.active.quietSummary', {
    from: formatMinutesOfDay(alert.quietHours.startMinute),
    to: formatMinutesOfDay(alert.quietHours.endMinute),
  });
  return `${daysPart} · ${quietPart}`;
}

/* ------------------------------------------------------------------ *
 * Notification permission / engine status
 * ------------------------------------------------------------------ */

const permissionMessage = computed(() => {
  switch (permission.value) {
    case 'granted':
      return t('notifications.engine.permissionGranted');
    case 'denied':
      return t('notifications.engine.permissionDenied');
    case 'unsupported':
      return t('notifications.engine.permissionUnsupported');
    default:
      return t('notifications.engine.permissionDefault');
  }
});

const permissionIcon = computed(() =>
  permission.value === 'granted'
    ? 'sym_o_notifications_active'
    : permission.value === 'denied' || permission.value === 'unsupported'
      ? 'sym_o_notifications_off'
      : 'sym_o_notifications',
);

const permissionTone = computed(() => (permission.value === 'granted' ? 'positive' : permission.value === 'default' ? 'primary' : 'muted'));

async function enableNotifications() {
  const result = await requestPermission();
  if (result === 'denied') {
    $q.notify({ type: 'warning', message: t('notifications.engine.permissionDenied') });
  }
}

/* ------------------------------------------------------------------ *
 * Recent delivery activity
 * ------------------------------------------------------------------ */

function outcomeIcon(outcome: DeliveryOutcome): string {
  switch (outcome) {
    case 'delivered':
      return 'sym_o_check_circle';
    case 'suppressed':
      return 'sym_o_bedtime';
    case 'missed':
      return 'sym_o_event_busy';
  }
}

function outcomeColor(outcome: DeliveryOutcome): string {
  switch (outcome) {
    case 'delivered':
      return 'positive';
    case 'suppressed':
      return 'grey';
    case 'missed':
      return 'warning';
  }
}

function outcomeLabel(outcome: DeliveryOutcome): string {
  switch (outcome) {
    case 'delivered':
      return t('notifications.recent.outcomeDelivered');
    case 'suppressed':
      return t('notifications.recent.outcomeSuppressed');
    case 'missed':
      return t('notifications.recent.outcomeMissed');
  }
}

function formatEventTime(at: DeliveryEvent['at']): string {
  const { hour, minute } = getOsloParts(new Date(at));
  return formatMinutesOfDay(hour * 60 + minute);
}
</script>
