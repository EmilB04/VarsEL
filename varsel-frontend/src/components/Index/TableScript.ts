import { computed } from 'vue'
import type { QTableColumn } from 'quasar'

// Define options for area and city selection
export const areaOptions = [
  { value: 'NO1', label: 'Øst-Norge' },
  { value: 'NO2', label: 'Sør-Norge' },
  { value: 'NO3', label: 'Midt-Norge' },
  { value: 'NO4', label: 'Nord-Norge' },
  { value: 'NO5', label: 'Vest-Norge' }
]

// Define specific cities with their areas
export const cityOptions = [
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
export const baseCities: Record<'NO1' | 'NO2' | 'NO3' | 'NO4' | 'NO5', string> = {
  NO1: 'Oslo',
  NO2: 'Kristiansand',
  NO3: 'Trondheim',
  NO4: 'Tromsø',
  NO5: 'Bergen'
}

export interface Price {
  time_start: string;
  time_end: string;
  NOK_per_kWh: number;
  area: string;
  city: string;
  date: string;
}

// Define the columns for the QTable
export const columns: QTableColumn[] = [
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

// Helper functions for price statistics
export function getMinPrice(prices: Price[]): number {
  if (prices.length === 0) return 0;
  return Math.min(...prices.map(p => p.NOK_per_kWh));
}

export function getMaxPrice(prices: Price[]): number {
  if (prices.length === 0) return 0;
  return Math.max(...prices.map(p => p.NOK_per_kWh));
}

export function getAvgPrice(prices: Price[]): number {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, p) => acc + p.NOK_per_kWh, 0);
  return sum / prices.length;
}

export function getPriceDifference(prices: Price[]): number {
  return getMaxPrice(prices) - getMinPrice(prices);
}

export function getMinPriceTime(prices: Price[]): string {
  if (prices.length === 0) return '';
  const minPrice = getMinPrice(prices);
  const minPriceData = prices.find(p => p.NOK_per_kWh === minPrice);
  return minPriceData ? minPriceData.time_start.slice(11, 16) : '';
}

export function getMaxPriceTime(prices: Price[]): string {
  if (prices.length === 0) return '';
  const maxPrice = getMaxPrice(prices);
  const maxPriceData = prices.find(p => p.NOK_per_kWh === maxPrice);
  return maxPriceData ? maxPriceData.time_start.slice(11, 16) : '';
}

// Composable for table functionality
export function useTableServices(selectedArea: { value: string }) {
  const filteredCityOptions = computed(() =>
    cityOptions.filter(city => city.area === selectedArea.value)
  )

  return {
    areaOptions,
    cityOptions,
    baseCities,
    columns,
    filteredCityOptions,
    getMinPrice,
    getMaxPrice,
    getAvgPrice,
    getPriceDifference,
    getMinPriceTime,
    getMaxPriceTime
  }
}
