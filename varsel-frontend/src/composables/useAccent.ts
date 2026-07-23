import { ref, watch } from 'vue';
import { useTheme } from './useTheme';

export type AccentColor =
  | 'teal'
  | 'indigo'
  | 'blue'
  | 'sky'
  | 'cyan'
  | 'emerald'
  | 'lime'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'pink'
  | 'fuchsia'
  | 'violet';

interface AccentDefinition {
  light: string;
  dark: string;
}

// "teal" matches VarsEL's own brand color exactly, so the default look is unchanged.
export const ACCENT_PRESETS: Record<AccentColor, AccentDefinition> = {
  teal: { light: '#00D9C0', dark: '#00D9C0' },
  indigo: { light: '#6366f1', dark: '#818cf8' },
  blue: { light: '#2563eb', dark: '#60a5fa' },
  sky: { light: '#0284c7', dark: '#38bdf8' },
  cyan: { light: '#0891b2', dark: '#22d3ee' },
  emerald: { light: '#059669', dark: '#34d399' },
  lime: { light: '#65a30d', dark: '#a3e635' },
  amber: { light: '#d97706', dark: '#fbbf24' },
  orange: { light: '#ea580c', dark: '#fb923c' },
  rose: { light: '#e11d48', dark: '#fb7185' },
  pink: { light: '#db2777', dark: '#f472b6' },
  fuchsia: { light: '#c026d3', dark: '#e879f9' },
  violet: { light: '#7c3aed', dark: '#a78bfa' },
};

export const DEFAULT_ACCENT: AccentColor = 'teal';

const ACCENT_KEY = 'accent';

function readStoredAccent(): AccentColor {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(ACCENT_KEY) : null;
  return stored && stored in ACCENT_PRESETS ? (stored as AccentColor) : DEFAULT_ACCENT;
}

// Module-level singleton state - shared across every component that calls useAccent().
const accent = ref<AccentColor>(readStoredAccent());
const { currentTheme } = useTheme();

function applyAccent() {
  if (typeof document === 'undefined') return;
  const preset = ACCENT_PRESETS[accent.value];
  const hex = currentTheme.value === 'dark' ? preset.dark : preset.light;
  // Quasar already reads --q-primary for every color="primary" component;
  // overriding it here repaints the whole app instantly, no rebuild needed.
  document.documentElement.style.setProperty('--q-primary', hex);
}

watch([accent, currentTheme], applyAccent, { immediate: true });

function setAccent(value: AccentColor) {
  accent.value = value;
  localStorage.setItem(ACCENT_KEY, value);
}

export function useAccent() {
  return { accent, setAccent };
}
