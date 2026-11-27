<template>
  <q-page class="app-page notification-page">
    <HeroSection
      :title="t('notifications.heroTitle')"
      :description="t('notifications.heroDescription')"
    />

    <q-card class="delivery-status">
      <q-icon
        :name="permissionIcon"
        class="panel-icon delivery-icon"
        :data-tone="permissionTone"
        aria-hidden="true"
      />
      <div class="delivery-copy" role="status">
        <p>{{ permissionMessage }}</p>
        <p v-if="isDegraded" class="delivery-warning">
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
        @click="enableNotifications"
      />
    </q-card>

    <div class="alert-grid alert-forms">
      <q-card class="alert-setup-card">
        <div class="alert-card-heading">
          <q-icon name="sym_o_notifications_active" class="panel-icon" aria-hidden="true" />
          <div>
            <h2 id="price-alert-title">{{ t('notifications.priceAlert.title') }}</h2>
            <p>{{ t('notifications.priceAlert.description') }}</p>
          </div>
        </div>

        <q-form
          novalidate
          class="alert-form"
          aria-labelledby="price-alert-title"
          @submit="savePriceAlert"
        >
          <div class="alert-field-grid">
            <AppSelect
              ref="priceAreaRef"
              v-model="priceForm.area"
              :options="areaOptions"
              :label="t('notifications.priceAlert.area')"
              :error="priceAreaError ? t('notifications.validation.area') : ''"
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
              ref="priceInputRef"
              v-model="priceForm.targetPrice"
              inputmode="decimal"
              :label="t('notifications.priceAlert.targetPrice')"
              :suffix="t('common.priceUnit')"
              :error="priceAmountError"
              :aria-invalid="priceAmountError"
              v-bind="priceAmountError ? { 'aria-describedby': 'price-threshold-error' } : {}"
              filled
              required
              hide-bottom-space
            >
              <template #prepend>
                <q-icon name="sym_o_payments" class="field-icon" aria-hidden="true" />
              </template>
              <template #error>
                <span id="price-threshold-error" role="alert">{{ t('notifications.validation.price') }}</span>
              </template>
            </q-input>
            <AppSelect
              v-model="priceForm.condition"
              :options="conditionOptions"
              :label="t('notifications.priceAlert.condition')"
              icon="sym_o_compare_arrows"
            />
          </div>

          <AlertScheduleFields
            v-model:days="priceForm.days"
            v-model:quiet-hours="priceForm.quietHours"
          />

          <div class="alert-form-actions">
            <q-toggle
              v-model="priceForm.enabled"
              :label="t('notifications.priceAlert.enable')"
              color="primary"
            />
            <q-btn
              :label="t('notifications.priceAlert.save')"
              type="submit"
              color="primary"
              icon="sym_o_save"
              unelevated
              no-caps
            />
          </div>
        </q-form>
      </q-card>

      <q-card class="alert-setup-card">
        <div class="alert-card-heading">
          <q-icon name="sym_o_schedule" class="panel-icon" aria-hidden="true" />
          <div>
            <h2 id="cheapest-alert-title">{{ t('notifications.cheapestAlert.title') }}</h2>
            <p>{{ t('notifications.cheapestAlert.description') }}</p>
          </div>
        </div>

        <q-form
          novalidate
          class="alert-form"
          aria-labelledby="cheapest-alert-title"
          @submit="saveCheapestAlert"
        >
          <div class="alert-field-grid">
            <AppSelect
              ref="cheapestAreaRef"
              v-model="cheapestForm.area"
              :options="areaOptions"
              :label="t('notifications.cheapestAlert.area')"
              :error="cheapestAreaError ? t('notifications.validation.area') : ''"
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
              class="notification-time"
              icon="sym_o_schedule"
            />
          </div>

          <AlertScheduleFields
            v-model:days="cheapestForm.days"
            v-model:quiet-hours="cheapestForm.quietHours"
          />

          <div class="alert-form-actions">
            <q-toggle
              v-model="cheapestForm.enabled"
              :label="t('notifications.cheapestAlert.enable')"
              color="primary"
            />
            <q-btn
              :label="t('notifications.cheapestAlert.save')"
              type="submit"
              color="primary"
              icon="sym_o_save"
              unelevated
              no-caps
            />
          </div>
        </q-form>
      </q-card>
    </div>

    <section class="alerts-section" aria-labelledby="saved-alerts-title">
      <h2 id="saved-alerts-title" class="table-heading">
        <q-icon name="sym_o_notifications" class="panel-icon" aria-hidden="true" />
        {{ t('notifications.active.heading') }}
      </h2>

      <div v-if="alertGroups.length" class="alert-grid">
        <q-card v-for="group in alertGroups" :key="group.kind" class="saved-group">
          <div class="saved-group-heading">
            <q-icon :name="group.icon" class="field-icon" aria-hidden="true" />
            <h3>{{ group.heading }}</h3>
          </div>
          <ul class="alerts-list">
            <li v-for="alert in group.alerts" :key="alert.id" class="alert-item">
              <div class="alert-item-copy">
                <div class="alert-location">
                  <strong>{{ getDisplayLocation(alert) }}</strong>
                  <span class="alert-area">{{ alert.area }}</span>
                </div>
                <p>{{ alertDetail(alert) }}</p>
                <p class="alert-schedule">
                  <q-icon name="sym_o_calendar_month" size="15px" aria-hidden="true" />
                  <span>{{ scheduleSummary(alert) }}</span>
                </p>
              </div>

              <div class="alert-controls">
                <q-toggle
                  v-model="alert.enabled"
                  :aria-label="
                    t('notifications.active.toggleLabel', { location: getDisplayLocation(alert) })
                  "
                  :label="
                    t(
                      alert.enabled
                        ? 'notifications.active.enabled'
                        : 'notifications.active.paused',
                    )
                  "
                  color="primary"
                  dense
                  @update:model-value="toggleAlert(alert)"
                />
                <q-btn
                  flat
                  round
                  icon="sym_o_delete"
                  :aria-label="t('notifications.active.deleteTooltip')"
                  class="delete-alert"
                  @click="deleteAlert(alert)"
                >
                  <q-tooltip>{{ t('notifications.active.deleteTooltip') }}</q-tooltip>
                </q-btn>
              </div>
            </li>
          </ul>
        </q-card>
      </div>
      <div v-else class="alerts-empty">
        <q-icon name="sym_o_notifications_off" class="panel-icon" aria-hidden="true" />
        <p>{{ t('notifications.active.emptyDescription') }}</p>
      </div>
    </section>

    <section class="alerts-section" aria-labelledby="recent-alerts-title">
      <h2 id="recent-alerts-title" class="table-heading">
        <q-icon name="sym_o_history" class="panel-icon" aria-hidden="true" />
        {{ t('notifications.recent.heading') }}
      </h2>

      <q-list v-if="recentDeliveries.length" separator class="recent-list">
        <q-item v-for="event in recentDeliveries" :key="`${event.key}-${event.at}`">
          <q-item-section avatar>
            <q-icon
              :name="outcomeIcon(event.outcome)"
              class="field-icon"
              :color="outcomeColor(event.outcome)"
              aria-hidden="true"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ event.body }}</q-item-label>
            <q-item-label caption>
              {{ outcomeLabel(event.outcome) }} · {{ formatEventTime(event.at) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="alerts-empty">
        <q-icon name="sym_o_schedule" class="panel-icon" aria-hidden="true" />
        <p>{{ t('notifications.recent.empty') }}</p>
      </div>
    </section>
  </q-page>
</template>

<style lang="scss" scoped>
.notification-page {
  color: var(--app-ink);
}
.delivery-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 16px;
  padding: 12px clamp(12px, 2vw, 20px);
}
.delivery-copy {
  flex: 1 1 170px;
  min-width: 0;
  color: var(--text-subtle);
}
.delivery-copy p {
  margin: 0;
}
.delivery-copy .delivery-warning {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  color: var(--warning-ink);
  font-size: 0.84rem;
}
.delivery-icon[data-tone='positive'] {
  background: color-mix(in srgb, var(--positive-ink) 12%, var(--surface-card));
  color: var(--positive-ink);
}
.delivery-icon[data-tone='muted'] {
  background: var(--surface-inset);
  color: var(--text-subtle);
}

.alert-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.alert-setup-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(12px, 2vw, 20px);
}
.alert-card-heading {
  display: flex;
  align-items: start;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.alert-card-heading h2 {
  margin: 0 0 3px;
  font-size: clamp(1.1rem, 2vw, 1.32rem);
  font-weight: 650;
  line-height: 1.25;
}
.alert-card-heading p {
  margin: 0;
  color: var(--text-subtle);
  font-size: 0.86rem;
}
.alert-form {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
}
.alert-field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 8px;
}
.notification-time {
  grid-column: 1 / -1;
}
.alert-form-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.alert-form-actions :deep(.q-toggle),
.alert-form-actions :deep(.q-btn),
.delivery-status :deep(.q-btn) {
  min-height: 44px;
}

.alerts-section {
  margin-top: clamp(24px, 4vw, 40px);
}
.alerts-section h2 {
  margin: 0 0 12px;
}
.saved-group {
  min-width: 0;
}
.saved-group-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
}
.saved-group-heading h3 {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 650;
  line-height: 1.3;
}
.alerts-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.alert-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 12px;
  padding: 10px 12px;
  border-top: 1px solid var(--border);
}
.alert-item-copy {
  flex: 1 1 200px;
  min-width: 0;
}
.alert-location,
.alert-schedule,
.alert-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}
.alert-area {
  padding: 2px 5px;
  border-radius: 5px;
  background: var(--surface-inset);
  color: var(--text-subtle);
  font: 500 0.68rem var(--data-font);
}
.alert-item-copy p {
  margin: 3px 0 0;
  color: var(--text-subtle);
  font-size: 0.84rem;
}
.alert-item-copy .alert-schedule {
  flex-wrap: nowrap;
  align-items: flex-start;
}
.alert-schedule :deep(.q-icon) {
  flex: none;
  margin-top: 2px;
}
.alert-schedule span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.alert-controls {
  justify-content: flex-end;
}
.alert-controls :deep(.q-toggle),
.alert-controls .delete-alert {
  min-height: 44px;
}
.alert-controls .delete-alert {
  min-width: 44px;
  color: var(--danger-ink);
}
.alerts-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px dashed var(--border-hover);
  border-radius: var(--panel-radius);
  color: var(--text-subtle);
}
.alerts-empty p {
  margin: 0;
}
.recent-list {
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface-card);
}
.recent-list :deep(.q-item__label--caption) {
  color: var(--text-subtle);
}

@media (max-width: 760px) {
  .alert-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 420px) {
  .alert-form-actions :deep(.q-btn),
  .delivery-status :deep(.q-btn) {
    width: 100%;
  }
  .alert-controls {
    flex: 1 0 100%;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { useQuasar, type QInput } from 'quasar';
import { useI18n } from 'vue-i18n';
import AlertScheduleFields from 'src/components/AlertScheduleFields.vue';
import AppSelect from 'src/components/AppSelect.vue';
import HeroSection from 'src/components/HeroSection.vue';
import { useAlertEngine, type DeliveryEvent } from 'src/composables/useAlertEngine';
import {
  formatMinutesOfDay,
  getOsloParts,
  timeOfDayOptions,
  type WeekdayIndex,
} from 'src/scripts/osloTime';
import { cityOptions, useAreaOptions } from 'src/scripts/TableScript';
import {
  createCheapestAlert,
  createPriceAlert,
  defaultQuietHours,
  loadAlerts,
  saveAlerts,
  type Alert,
  type DeliveryOutcome,
  type PriceCondition,
  type QuietHours,
} from 'src/scripts/alertStore';

const $q = useQuasar();
const { t, locale } = useI18n();
const { permission, isDegraded, recentDeliveries, requestPermission, runOnce } = useAlertEngine();

/* ------------------------------------------------------------------ *
 * Alerts (unified store)
 * ------------------------------------------------------------------ */

const alerts = ref<Alert[]>(loadAlerts());

const alertGroups = computed(() =>
  [
    {
      kind: 'price',
      icon: 'sym_o_notifications_active',
      heading: t('notifications.active.priceAlertsTitle'),
      alerts: alerts.value.filter(({ kind }) => kind === 'price'),
    },
    {
      kind: 'cheapest',
      icon: 'sym_o_schedule',
      heading: t('notifications.active.cheapestAlertsTitle'),
      alerts: alerts.value.filter(({ kind }) => kind === 'cheapest'),
    },
  ].filter((group) => group.alerts.length > 0),
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
const priceCityOptions = computed(() =>
  cityOptions.filter((city) => city.area === priceForm.value.area),
);
const cheapestCityOptions = computed(() =>
  cityOptions.filter((city) => city.area === cheapestForm.value.area),
);

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
  city: string | null;
  targetPrice: string | number | null;
  condition: PriceCondition;
  enabled: boolean;
  days: WeekdayIndex[];
  quietHours: QuietHours;
}

interface CheapestFormState {
  area: string;
  city: string | null;
  notificationTime: string;
  enabled: boolean;
  days: WeekdayIndex[];
  quietHours: QuietHours;
}

function emptyPriceForm(): PriceFormState {
  return {
    area: '',
    city: null,
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
    city: null,
    notificationTime: '07:00',
    enabled: true,
    days: [],
    quietHours: defaultQuietHours(),
  };
}

const priceForm = ref<PriceFormState>(emptyPriceForm());
const cheapestForm = ref<CheapestFormState>(emptyCheapestForm());

const priceAreaRef = ref<InstanceType<typeof AppSelect> | null>(null);
const cheapestAreaRef = ref<InstanceType<typeof AppSelect> | null>(null);
const priceInputRef = ref<QInput | null>(null);
const submittedPrice = ref(false);
const submittedCheapest = ref(false);
const priceAreaError = computed(() => submittedPrice.value && !priceForm.value.area);
const cheapestAreaError = computed(() => submittedCheapest.value && !cheapestForm.value.area);

const targetAmount = computed(() => {
  const input = String(priceForm.value.targetPrice ?? '')
    .trim()
    .replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input)) return null;
  const amount = Number(input);
  return Number.isFinite(amount) ? amount : null;
});
const priceAmountError = computed(() => submittedPrice.value && targetAmount.value === null);

watch(
  () => priceForm.value.area,
  () => {
    priceForm.value.city = null;
  },
  { flush: 'sync' },
);
watch(
  () => cheapestForm.value.area,
  () => {
    cheapestForm.value.city = null;
  },
  { flush: 'sync' },
);

async function savePriceAlert() {
  submittedPrice.value = true;
  const amount = targetAmount.value;
  const { area, city, condition, enabled, days, quietHours } = priceForm.value;
  if (!area || amount === null) {
    await nextTick();
    if (!area) priceAreaRef.value?.focus();
    else priceInputRef.value?.focus();
    return;
  }

  const alert = createPriceAlert({
    area,
    city: city ?? '',
    targetPrice: amount,
    condition,
    enabled,
    days,
    quietHours,
  });
  alerts.value = [...alerts.value, alert];
  persist();
  priceForm.value = emptyPriceForm();
  submittedPrice.value = false;
  $q.notify({ type: 'positive', message: t('notifications.notify.priceAlertSaved') });
}

async function saveCheapestAlert() {
  submittedCheapest.value = true;
  const { area, city, notificationTime, enabled, days, quietHours } = cheapestForm.value;
  if (!area || !notificationTime) {
    await nextTick();
    cheapestAreaRef.value?.focus();
    return;
  }

  const alert = createCheapestAlert({
    area,
    city: city ?? '',
    notificationTime,
    enabled,
    days,
    quietHours,
  });
  alerts.value = [...alerts.value, alert];
  persist();
  cheapestForm.value = emptyCheapestForm();
  submittedCheapest.value = false;
  $q.notify({ type: 'positive', message: t('notifications.notify.cheapestAlertSaved') });
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
  $q.dialog({
    title: t('notifications.active.deleteTooltip'),
    message: t(confirmKey),
    cancel: { label: t('common.cancel'), flat: true, noCaps: true },
    ok: { label: t('notifications.active.deleteTooltip'), color: 'negative', noCaps: true },
    focus: 'cancel',
  }).onOk(() => {
    alerts.value = alerts.value.filter((existing) => existing.id !== alert.id);
    persist();

    const doneKey =
      alert.kind === 'price'
        ? 'notifications.notify.priceAlertDeleted'
        : 'notifications.notify.cheapestAlertDeleted';
    $q.notify({ type: 'positive', message: t(doneKey) });
  });
}

/* ------------------------------------------------------------------ *
 * Display helpers
 * ------------------------------------------------------------------ */

function getDisplayLocation(alert: Pick<Alert, 'area' | 'city'>): string {
  if (alert.city) {
    const match = cityOptions.find(
      (option) => option.area === alert.area && option.value === alert.city,
    );
    return match ? match.label : alert.city;
  }
  return areaOptions.value.find(({ value }) => value === alert.area)?.label ?? alert.area;
}

const amountFormatter = computed(
  () => new Intl.NumberFormat(locale.value, { maximumSignificantDigits: 15 }),
);
function alertDetail(alert: Alert) {
  if (alert.kind === 'cheapest') {
    return t('notifications.active.cheapestAlertDetail', { time: alert.notificationTime });
  }
  return t('notifications.active.priceAlertDetail', {
    condition: getConditionLabel(alert.condition),
    price: amountFormatter.value.format(alert.targetPrice),
  });
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

const permissionTone = computed(() =>
  permission.value === 'granted'
    ? 'positive'
    : permission.value === 'default'
      ? 'primary'
      : 'muted',
);

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
