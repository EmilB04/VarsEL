import { ref } from 'vue';

const TAX_KEY = 'isTaxIncluded';

function readStoredTaxIncluded(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem(TAX_KEY) === 'true';
}

// Module-level singleton state - shared across every component that calls useTaxMode(),
// so toggling it in SettingsMenu.vue immediately updates already-fetched prices
// on IndexPage/HistoryPage without needing a refetch.
const isTaxIncluded = ref(readStoredTaxIncluded());

function setTaxIncluded(value: boolean) {
  isTaxIncluded.value = value;
  localStorage.setItem(TAX_KEY, value.toString());
}

export function useTaxMode() {
  return { isTaxIncluded, setTaxIncluded };
}
