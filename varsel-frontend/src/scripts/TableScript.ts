import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QTableColumn } from 'quasar'

// Region codes - labels are translated inside useTableServices() via common.areas.*
export const AREA_CODES = ['NO1', 'NO2', 'NO3', 'NO4', 'NO5'] as const
export type AreaCode = typeof AREA_CODES[number]

// Define specific cities with their areas - proper nouns, same in every language
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

// Standalone composable for translated area/region options - usable without a
// selectedArea ref (e.g. when a page manages multiple independent area selections).
export function useAreaOptions() {
  const { t } = useI18n();
  return computed(() =>
    AREA_CODES.map(code => ({ value: code, label: t(`common.areas.${code}`) }))
  );
}

// Composable for table functionality
export function useTableServices(selectedArea: { value: string }) {
  const { t } = useI18n();

  const areaOptions = useAreaOptions();

  const filteredCityOptions = computed(() =>
    cityOptions.filter(city => city.area === selectedArea.value)
  )

  const columns = computed<QTableColumn[]>(() => [
    {
      name: 'area',
      label: t('common.tableColumns.area'),
      field: row => t(`common.areas.${row.area}`),
      align: 'left' as const
    },
    { name: 'city', label: t('common.tableColumns.city'), field: 'city', align: 'left' as const },
    {
      name: 'date', label: t('common.tableColumns.date'), field: row => {
        const [year, month, day] = row.date.split('-');
        return `${day}.${month}.${year}`; // DD.MM.YYYY format
      }, align: 'left' as const
    },
    { name: 'time_start', label: t('common.tableColumns.timeStart'), field: row => row.time_start.slice(11, 16), align: 'left' as const },
    { name: 'time_end', label: t('common.tableColumns.timeEnd'), field: row => row.time_end.slice(11, 16), align: 'left' as const },
    { name: 'NOK_per_kWh', label: t('common.tableColumns.price'), field: 'NOK_per_kWh', align: 'right' as const, format: (val: number) => `${val.toFixed(2)} kr` }
  ]);

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
