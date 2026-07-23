<template>
  <div ref="rootRef" class="settings-menu">
    <button
      type="button"
      class="gear-trigger"
      :class="[`gear-trigger--${variant}`, { 'gear-trigger--open': open }]"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="t('nav.settings')"
      @click="open = !open"
    >
      <q-icon name="settings" class="gear-icon" />
      <span v-if="variant === 'bottom'" class="gear-label">{{ t('nav.settings') }}</span>
    </button>

    <div
      role="dialog"
      :aria-label="t('nav.settings')"
      class="settings-panel"
      :class="[`settings-panel--${variant}`, { 'settings-panel--open': open }]"
    >
      <div class="panel-header">
        <span class="panel-title">{{ t('nav.settings') }}</span>
        <button type="button" class="panel-close" :aria-label="t('common.close')" @click="open = false">
          <q-icon name="close" size="16px" />
        </button>
      </div>

      <section class="menu-section">
        <h3 class="menu-heading">
          <q-icon name="language" size="14px" />
          {{ t('settingsMenu.language.section') }}
        </h3>
        <div class="option-list">
          <button
            v-for="lang in languages"
            :key="lang.code"
            type="button"
            role="option"
            :aria-selected="locale === lang.code"
            class="option-row"
            :class="{ 'option-row--selected': locale === lang.code }"
            @click="setLocale(lang.code)"
          >
            <span>{{ lang.label }}</span>
            <span v-if="locale === lang.code" class="selected-dot" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section class="menu-section menu-section--bordered">
        <h3 class="menu-heading">
          <q-icon name="palette" size="14px" />
          {{ t('settingsMenu.appearance.section') }}
        </h3>
        <div class="segmented">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            type="button"
            :aria-pressed="theme === opt.value"
            class="segmented-btn"
            :class="{ 'segmented-btn--selected': theme === opt.value }"
            @click="setTheme(opt.value)"
          >
            <q-icon :name="opt.icon" size="16px" />
            {{ opt.label }}
          </button>
        </div>
      </section>

      <section class="menu-section menu-section--bordered">
        <h3 class="menu-heading">
          <q-icon name="colorize" size="14px" />
          {{ t('settingsMenu.accent.section') }}
        </h3>
        <div class="swatch-row" role="listbox" :aria-label="t('settingsMenu.accent.section')">
          <button
            v-for="key in accentKeys"
            :key="key"
            type="button"
            role="option"
            :aria-selected="accent === key"
            :aria-label="t(`settingsMenu.accent.${key}`)"
            class="swatch"
            :class="{ 'swatch--selected': accent === key }"
            @click="setAccent(key)"
          >
            <span class="swatch-dot" :style="{ background: ACCENT_PRESETS[key][currentTheme] }" />
          </button>
        </div>
      </section>

      <section class="menu-section menu-section--bordered">
        <h3 class="menu-heading">
          <q-icon name="receipt_long" size="14px" />
          {{ t('settingsMenu.tax.section') }}
        </h3>
        <div class="segmented">
          <button
            type="button"
            :aria-pressed="!isTaxIncluded"
            class="segmented-btn"
            :class="{ 'segmented-btn--selected': !isTaxIncluded }"
            @click="setTaxIncluded(false)"
          >
            <q-icon name="money_off" size="16px" />
            {{ t('settingsMenu.tax.excluded') }}
          </button>
          <button
            type="button"
            :aria-pressed="isTaxIncluded"
            class="segmented-btn"
            :class="{ 'segmented-btn--selected': isTaxIncluded }"
            @click="setTaxIncluded(true)"
          >
            <q-icon name="receipt_long" size="16px" />
            {{ t('settingsMenu.tax.included') }}
          </button>
        </div>
        <p class="menu-caption">
          {{ isTaxIncluded ? t('settingsMenu.tax.includedDescription') : t('settingsMenu.tax.excludedDescription') }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme, type Theme } from 'src/composables/useTheme';
import { useAccent, ACCENT_PRESETS, type AccentColor } from 'src/composables/useAccent';
import { useTaxMode } from 'src/composables/useTaxMode';

withDefaults(defineProps<{ variant?: 'nav' | 'bottom' }>(), { variant: 'nav' });

const { t, locale } = useI18n();
const { theme, currentTheme, setTheme } = useTheme();
const { accent, setAccent } = useAccent();
const { isTaxIncluded, setTaxIncluded } = useTaxMode();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const languages = computed(() => [
  { code: 'no-NO' as const, label: t('settingsMenu.language.no') },
  { code: 'en-US' as const, label: t('settingsMenu.language.en') },
]);

function setLocale(code: 'no-NO' | 'en-US') {
  locale.value = code;
}

const themeOptions = computed<{ value: Theme; label: string; icon: string }[]>(() => [
  { value: 'light', label: t('settingsMenu.appearance.light'), icon: 'light_mode' },
  { value: 'system', label: t('settingsMenu.appearance.system'), icon: 'settings_suggest' },
  { value: 'dark', label: t('settingsMenu.appearance.dark'), icon: 'dark_mode' },
]);

const accentKeys = Object.keys(ACCENT_PRESETS) as AccentColor[];

function handleClickOutside(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    open.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.settings-menu {
  position: relative;
  display: inline-flex;
}

// Trigger button - nav variant matches the pill nav-links, bottom variant matches the tab bar
.gear-trigger--nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .gear-icon {
    font-size: 1.25rem;
    opacity: 0.7;
    transition: transform 0.3s ease, opacity 0.2s ease;
  }

  &:hover {
    background: color-mix(in srgb, var(--q-primary) 10%, transparent);
    .gear-icon { opacity: 1; }
  }

  &.gear-trigger--open {
    background: var(--q-primary);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--q-primary) 30%, transparent);

    .gear-icon {
      opacity: 1;
      color: white;
      transform: rotate(45deg);
    }
  }
}

.gear-trigger--bottom {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  min-height: 56px;
  padding: 0.375rem 0.25rem;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .gear-icon {
    font-size: 1.35rem;
    transition: transform 0.3s ease;
  }

  .gear-label {
    font-size: 0.7rem;
    font-weight: 600;
  }

  &.gear-trigger--open {
    opacity: 1;
    color: var(--q-primary);
    .gear-icon { transform: rotate(45deg); }
  }
}

// Floating panel
.settings-panel {
  position: absolute;
  z-index: 3000;
  width: 18rem;
  max-width: calc(100vw - 2rem);
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface-card);
  backdrop-filter: blur(24px);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
  transform-origin: top right;
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  pointer-events: none;

  &.settings-panel--open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
}

.settings-panel--nav {
  right: 0;
  top: calc(100% + 0.6rem);
}

.settings-panel--bottom {
  right: 0;
  bottom: calc(100% + 0.6rem);
  transform-origin: bottom right;
}

.menu-section--bordered {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -0.25rem -0.25rem 0.25rem;
}

.panel-title {
  padding-left: 0.25rem;
  font-size: 0.95rem;
  font-weight: 700;
}

.panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--text-subtle);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--surface);
    color: inherit;
  }
}

.menu-heading {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0 0 0.5rem;
  padding: 0 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--surface);
  }

  &.option-row--selected {
    background: color-mix(in srgb, var(--q-primary) 16%, var(--surface-card));
  }

  .selected-dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: var(--q-primary);
  }
}

.segmented {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 0.25rem;
  background: var(--surface);
  border-radius: 12px;
  padding: 0.25rem;
}

.segmented-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-subtle);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: inherit;
  }

  &.segmented-btn--selected {
    background: var(--q-primary);
    color: white;
  }
}

.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 0.125rem;
}

.swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 9999px;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.08);
  }

  &.swatch--selected {
    border-color: var(--q-primary);
  }

  .swatch-dot {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
}

.menu-caption {
  margin: 0.5rem 0 0;
  padding: 0 0.25rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
