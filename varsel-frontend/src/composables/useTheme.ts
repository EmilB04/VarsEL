import { ref, computed, watch } from 'vue';
import { Dark } from 'quasar';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_KEY = 'theme';

function getSystemPrefersDark(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStoredTheme(): Theme {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

// Module-level singleton state - shared across every component that calls useTheme().
const theme = ref<Theme>(readStoredTheme());
const systemPrefersDark = ref(getSystemPrefersDark());

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    systemPrefersDark.value = event.matches;
  });
}

const currentTheme = computed<ResolvedTheme>(() =>
  theme.value === 'system' ? (systemPrefersDark.value ? 'dark' : 'light') : theme.value,
);

// NOT immediate: this module evaluates as soon as App.vue is imported, which is
// BEFORE `app.use(Quasar, ...)` runs. Applying Dark.set() that early gets silently
// overwritten once Quasar's own install sets document.body's classes afterward.
// The initial value is applied explicitly via initTheme() from App.vue's onMounted,
// once Quasar is guaranteed to be fully installed. This watch only needs to handle
// changes made *after* that point (user toggling the setting, system theme changes).
watch(currentTheme, (value) => {
  Dark.set(value === 'dark');
});

function setTheme(value: Theme) {
  theme.value = value;
  localStorage.setItem(THEME_KEY, value);
}

// Call once after the app has mounted to apply the stored/system theme -
// see the comment above the watch() call for why this can't just be `immediate: true`.
export function initTheme() {
  Dark.set(currentTheme.value === 'dark');
}

export function useTheme() {
  return { theme, currentTheme, setTheme };
}
