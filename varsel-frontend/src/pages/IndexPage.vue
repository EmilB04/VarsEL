<template>
  <q-page class="q-pa-md">
    <q-form @submit="fetchPrices">
      <q-select
        v-model="region"
        :options="['NO1', 'NO2', 'NO3', 'NO4', 'NO5']"
        label="Region"
        emit-value
        map-options
      />
      <q-input v-model="date" label="Dato" type="date" />
      <q-btn label="Hent priser" type="submit" color="primary" />
    </q-form>

    <q-table
      v-if="prices.length"
      :rows="prices"
      :columns="columns"
      row-key="time_start"
      class="q-mt-md"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'boot/axios'

const region = ref('NO1')
const date = ref('2025-06-25')
const prices = ref([])

const columns = [
  { name: 'time_start', label: 'Start', field: 'time_start' },
  { name: 'time_end', label: 'Slutt', field: 'time_end' },
  { name: 'NOK_per_kWh', label: 'Pris (NOK/kWh)', field: 'NOK_per_kWh' }
]

async function fetchPrices() {
  try {
    const res = await api.get(`/prices/${region.value}/${date.value}`)
    prices.value = JSON.parse(res.data).prices
  } catch (err) {
    console.error(err)
  }
}
</script>
