<template>
  <q-page class="q-pa-md">
    <q-form @submit="fetchPrices">
      <q-select
        v-model="region"
        :options="[
          { value: 'NO1', label: 'Oslo (Øst-Norge)' },
          { value: 'NO2', label: 'Kristiansand (Sør-Norge)' },
          { value: 'NO3', label: 'Trondheim (Midt-Norge)' },
          { value: 'NO4', label: 'Tromsø (Nord-Norge)' },
          { value: 'NO5', label: 'Bergen (Vest-Norge)' },
          { value: 'NO2', label: 'Arendal (Sør-Norge)' },
          { value: 'NO4', label: 'Bodø (Nord-Norge)' },
          { value: 'NO1', label: 'Drammen (Øst-Norge)' },
          { value: 'NO1', label: 'Fredrikstad (Øst-Norge)' },
          { value: 'NO2', label: 'Haugesund (Sør-Norge)' },
          { value: 'NO1', label: 'Moss (Øst-Norge)' },
          { value: 'NO2', label: 'Porsgrunn (Sør-Norge)' },
          { value: 'NO2', label: 'Sandefjord (Sør-Norge)' },
          { value: 'NO2', label: 'Stavanger (Sør-Norge)' },
          { value: 'NO2', label: 'Tønsberg (Sør-Norge)' },
          { value: 'NO3', label: 'Ålesund (Midt-Norge)' }
        ]"
        label="Region"
        class="q-mb-sm"
        emit-value
        map-options
      />
      <q-input v-model="date" label="Dato" type="date" class="q-mb-sm" />
      <q-input v-model="startHour" label="Starttime (valgfritt)" type="number" class="q-mb-sm" />
      <q-input v-model="endHour" label="Slutttime (valgfritt)" type="number" class="q-mb-sm" />
      <q-btn label="Hent priser" type="submit" color="primary" />
    </q-form>

    <q-separator class="q-my-md" />

    <q-table
      v-if="prices.length"
      :rows="prices"
      :columns="columns"
      row-key="time_start"
      flat
      bordered
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'boot/axios'

const region = ref('NO1')
const date = ref(new Date().toISOString().slice(0, 10))
const startHour = ref<number | null>(null)
const endHour = ref<number | null>(null)
const prices = ref([])

import type { QTableColumn } from 'quasar'

const columns: QTableColumn[] = [
  { name: 'time_start', label: 'Start', field: 'time_start', align: 'left' as const },
  { name: 'time_end', label: 'Slutt', field: 'time_end', align: 'left' as const },
  { name: 'NOK_per_kWh', label: 'Pris (kr/kWh)', field: 'NOK_per_kWh', align: 'right' as const, format: (val: number) => `${val.toFixed(2)} kr` }
]

async function fetchPrices() {
  try {
    let url = `/prices/${region.value}/${date.value}`
    if (startHour.value !== null && endHour.value !== null) {
      url += `?startHour=${startHour.value}&endHour=${endHour.value}`
    }

    const response = await api.get(url)
    const json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
    prices.value = json.prices
  } catch (err) {
    console.error('Klarte ikke hente priser:', err)
  }
}
</script>
