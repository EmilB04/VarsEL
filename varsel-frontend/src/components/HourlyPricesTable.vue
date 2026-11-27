<template>
  <section class="hourly-prices q-mt-xl" :aria-labelledby="headingId">
    <q-table
      class="price-table hourly-table"
      :rows="prices"
      :columns="columns"
      row-key="rowKey"
      flat
      v-model:pagination="pagination"
    >
      <template #top>
        <h2 :id="headingId" class="table-heading">
          <q-icon name="sym_o_schedule" class="panel-icon" aria-hidden="true" />
          {{ t('index.tableHeading') }}
        </h2>
      </template>

      <template #header="scope">
        <q-tr :props="scope">
          <th
            v-for="column in scope.cols"
            :key="column.name"
            scope="col"
            :class="`text-${column.align}`"
            :aria-sort="
              pagination.sortBy === column.name
                ? pagination.descending
                  ? 'descending'
                  : 'ascending'
                : 'none'
            "
          >
            <button type="button" class="sort-button" @click="scope.sort(column.name)">
              {{ column.label }}
              <q-icon
                :name="
                  pagination.sortBy === column.name
                    ? pagination.descending
                      ? 'sym_o_arrow_downward'
                      : 'sym_o_arrow_upward'
                    : 'sym_o_unfold_more'
                "
                size="15px"
                aria-hidden="true"
              />
            </button>
          </th>
        </q-tr>
      </template>

      <template #body="scope">
        <q-tr :props="scope" :class="{ 'current-row': scope.row.rowKey === currentRowKey }">
          <q-td key="time_start" :props="scope">
            <div class="hour-cell">
              <span class="hour-range">
                {{ scope.row.time_start.slice(11, 16) }}<span class="range-dash">–</span
                >{{ scope.row.time_end.slice(11, 16) }}
              </span>
              <span v-if="scope.row.rowKey === currentRowKey" class="period-label current-label">
                <span class="current-dot" aria-hidden="true"></span>
                {{ t('priceSummary.chartNow') }}
              </span>
              <span v-if="scope.row.NOK_per_kWh === lowestPrice" class="period-label lowest-label">
                {{ t('index.hourlyLowest') }}
              </span>
            </div>
          </q-td>
          <q-td key="NOK_per_kWh" :props="scope" class="hour-price">
            {{ number.format(scope.row.NOK_per_kWh) }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getMinPrice, type Price } from 'src/scripts/TableScript';

const props = defineProps<{ prices: Price[]; currentRowKey: string | null }>();
const { t, locale } = useI18n();
const headingId = useId();
const pagination = ref({ sortBy: 'time_start', descending: false, page: 1, rowsPerPage: 12 });
const lowestPrice = computed(() => getMinPrice(props.prices));
const number = computed(
  () =>
    new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }),
);
const columns = computed<QTableColumn<Price>[]>(() => [
  {
    name: 'time_start',
    label: t('index.hourlyPeriod'),
    field: 'time_start',
    align: 'left',
    sortable: true,
  },
  {
    name: 'NOK_per_kWh',
    label: t('common.tableColumns.price'),
    field: 'NOK_per_kWh',
    align: 'right',
    sortable: true,
  },
]);
</script>

<style lang="scss" scoped>
.hourly-prices .table-heading {
  margin: 0;
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 44px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  white-space: nowrap;
}

.hourly-table :deep(th[aria-sort='ascending']),
.hourly-table :deep(th[aria-sort='descending']) {
  color: var(--q-primary);
}

.sort-button:hover {
  color: var(--q-primary);
}

.hourly-table :deep(th),
.hourly-table :deep(td) {
  padding-inline: clamp(10px, 2.1vw, 20px);
}

.hourly-table :deep(td) {
  height: 48px;
}

.hourly-table :deep(.current-row > td) {
  background: var(--accent-soft);
}

.hour-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 8px;
}

.hour-range {
  white-space: nowrap;
}

.range-dash {
  margin-inline: 0.14em;
  color: var(--text-muted);
}

.period-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 20px;
  padding: 2px 7px;
  border-radius: 999px;
  font: 650 0.7rem / 1.1 var(--ui-font);
  white-space: nowrap;
}

.current-label {
  background: var(--surface-card);
  color: var(--q-primary);
  box-shadow: inset 0 0 0 1px var(--accent-edge);
}

.current-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.lowest-label {
  background: color-mix(in srgb, var(--positive-ink) 11%, var(--surface-card));
  color: var(--positive-ink);
}

.hourly-table :deep(td.hour-price) {
  font-size: clamp(0.85rem, 2vw, 1rem);
}

@media (max-width: 480px) {
  .hourly-table :deep(th:first-child),
  .hourly-table :deep(td:first-child) {
    white-space: normal;
  }
}
</style>
