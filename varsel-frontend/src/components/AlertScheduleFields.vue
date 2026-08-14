<template>
  <div class="schedule-fields">
    <fieldset class="field-group">
      <legend class="field-legend">
        <q-icon name="sym_o_calendar_month" size="16px" aria-hidden="true" />
        {{ t('notifications.schedule.daysLabel') }}
      </legend>

      <div class="day-row">
        <button
          v-for="day in weekdays"
          :key="day.value"
          type="button"
          class="day-chip"
          :class="{ 'day-chip--on': isDayActive(day.value) }"
          :aria-pressed="isDayActive(day.value)"
          :aria-label="day.full"
          @click="toggleDay(day.value)"
        >
          {{ day.short }}
        </button>
      </div>
      <p class="field-hint">
        {{ days.length === 0 ? t('notifications.schedule.everyDay') : t('notifications.schedule.selectedDays', { count: days.length }) }}
      </p>
    </fieldset>

    <fieldset class="field-group">
      <legend class="field-legend">
        <q-icon name="sym_o_bedtime" size="16px" aria-hidden="true" />
        {{ t('notifications.schedule.quietTitle') }}
      </legend>

      <q-toggle
        :model-value="quietHours.enabled"
        :label="t('notifications.schedule.quietEnable')"
        color="primary"
        dense
        @update:model-value="setQuietEnabled"
      />

      <div v-if="quietHours.enabled" class="quiet-row">
        <AppSelect
          :model-value="quietHours.startMinute"
          :options="timeOptions"
          :label="t('notifications.schedule.quietFrom')"
          icon="sym_o_bedtime"
          @update:model-value="(value) => setQuietBound('startMinute', value)"
        />
        <AppSelect
          :model-value="quietHours.endMinute"
          :options="timeOptions"
          :label="t('notifications.schedule.quietTo')"
          icon="sym_o_light_mode"
          @update:model-value="(value) => setQuietBound('endMinute', value)"
        />
      </div>

      <p class="field-hint">{{ t('notifications.schedule.quietDescription') }}</p>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppSelect from './AppSelect.vue';
import { timeOfDayOptions, type WeekdayIndex } from 'src/scripts/osloTime';
import type { QuietHours } from 'src/scripts/alertStore';

const props = defineProps<{
  days: WeekdayIndex[];
  quietHours: QuietHours;
}>();

const emit = defineEmits<{
  'update:days': [value: WeekdayIndex[]];
  'update:quietHours': [value: QuietHours];
}>();

const { t } = useI18n();

// Monday-first ordering to match Norwegian convention, while the stored values
// stay aligned with Date#getDay() (0 = Sunday).
const WEEKDAY_ORDER: WeekdayIndex[] = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const weekdays = computed(() =>
  WEEKDAY_ORDER.map((value) => ({
    value,
    short: t(`notifications.weekdaysShort.${WEEKDAY_KEYS[value]}`),
    full: t(`notifications.weekdays.${WEEKDAY_KEYS[value]}`),
  })),
);

// Half-hour granularity keeps the list short enough to scan.
const timeOptions = timeOfDayOptions(30);

// An empty selection means "every day", so an all-selected state is normalised
// back to empty rather than stored as all seven.
function isDayActive(day: WeekdayIndex): boolean {
  return props.days.length === 0 || props.days.includes(day);
}

function toggleDay(day: WeekdayIndex) {
  const base = props.days.length === 0 ? [...WEEKDAY_ORDER] : [...props.days];
  const next = base.includes(day) ? base.filter((d) => d !== day) : [...base, day];

  // Refuse to leave the alert with no active day at all - that would silently
  // disable it while still showing as enabled.
  if (next.length === 0) return;

  emit('update:days', next.length === 7 ? [] : next.sort((a, b) => a - b));
}

function setQuietEnabled(enabled: boolean) {
  emit('update:quietHours', { ...props.quietHours, enabled });
}

function setQuietBound(key: 'startMinute' | 'endMinute', value: string | number | null) {
  if (typeof value !== 'number') return;
  emit('update:quietHours', { ...props.quietHours, [key]: value });
}
</script>

<style lang="scss" scoped>
.schedule-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  margin: 0;
  padding: 0;
  border: none;
}

.field-legend {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.625rem;
  padding: 0;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
}

.day-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.day-chip {
  min-width: 2.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-subtle);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--border-hover);
    color: inherit;
  }

  &--on {
    background: var(--q-primary);
    border-color: var(--q-primary);
    color: white;
  }
}

.quiet-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.field-hint {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}
</style>
