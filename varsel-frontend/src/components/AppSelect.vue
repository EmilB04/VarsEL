<template>
  <div class="app-select" :class="{ 'app-select--disabled': disable }">
    <!-- role="combobox" + aria-activedescendant keeps DOM focus on the trigger
         for the whole interaction, so focus return on close is automatic and no
         focus trap is needed inside the teleported listbox. -->
    <button
      :id="triggerId"
      ref="triggerRef"
      type="button"
      role="combobox"
      class="select-trigger"
      :class="{ 'select-trigger--open': open, 'select-trigger--filled': hasValue }"
      :disabled="disable === true"
      :aria-expanded="open"
      :aria-controls="listboxId"
      v-bind="activeDescendant"
      aria-haspopup="listbox"
      :aria-labelledby="`${labelId} ${triggerId}`"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <q-icon v-if="icon" :name="icon" class="select-icon" aria-hidden="true" />

      <span class="select-body">
        <span :id="labelId" class="select-label" :class="{ 'select-label--floated': floated }">
          {{ label }}
        </span>
        <span v-if="hasValue" class="select-value">{{ selectedLabel }}</span>
      </span>

      <span
        v-if="clearable && hasValue && !disable"
        class="select-clear"
        role="button"
        tabindex="-1"
        :aria-label="t('common.clear')"
        @click.stop="clear"
        @keydown.enter.stop.prevent="clear"
      >
        <q-icon name="close" size="16px" aria-hidden="true" />
      </span>

      <q-icon name="keyboard_arrow_down" class="select-arrow" aria-hidden="true" />
    </button>

    <!-- Teleported to <body> so no ancestor's overflow, stacking context or
         max-width can clip the options, and positioned with explicit viewport
         collision handling below. -->
    <Teleport to="body">
      <div
        v-if="open"
        :id="listboxId"
        ref="menuRef"
        role="listbox"
        class="select-menu"
        :aria-labelledby="labelId"
        :style="menuStyle"
      >
        <p v-if="options.length === 0" class="select-empty">{{ t('common.noOptions') }}</p>

        <div
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="`${String(option.value)}-${index}`"
          ref="optionRefs"
          role="option"
          class="select-option"
          :class="{
            'select-option--active': index === activeIndex,
            'select-option--selected': isSelected(option),
          }"
          :aria-selected="isSelected(option)"
          @click="choose(option)"
          @pointermove="activeIndex = index"
        >
          <span class="select-option-label">{{ option.label }}</span>
          <q-icon v-if="isSelected(option)" name="check" size="18px" aria-hidden="true" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export interface AppSelectOption {
  label: string;
  value: string | number | null;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null;
    options: AppSelectOption[];
    label: string;
    icon?: string;
    disable?: boolean;
    clearable?: boolean;
  }>(),
  { icon: '', disable: false, clearable: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string | number | null] }>();

const { t } = useI18n();

// Teleported markup lives outside this component's DOM subtree, so the ARIA
// wiring between trigger and listbox has to go through real unique ids.
const uid = useId();
const triggerId = `select-trigger-${uid}`;
const listboxId = `select-listbox-${uid}`;
const labelId = `select-label-${uid}`;
const optionId = (index: number) => `select-option-${uid}-${index}`;

const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const optionRefs = ref<HTMLElement[]>([]);

const open = ref(false);
const activeIndex = ref(-1);
const menuStyle = ref<Record<string, string>>({});

// Bound as a whole object so the attribute is simply absent when the menu is
// closed, rather than present-but-undefined.
const activeDescendant = computed(() =>
  open.value && activeIndex.value >= 0
    ? { 'aria-activedescendant': optionId(activeIndex.value) }
    : {},
);

const selectedIndex = computed(() =>
  props.options.findIndex((option) => option.value === props.modelValue),
);
const selectedLabel = computed(() => props.options[selectedIndex.value]?.label ?? '');
const hasValue = computed(() => selectedIndex.value !== -1);
const floated = computed(() => hasValue.value || open.value);

function isSelected(option: AppSelectOption): boolean {
  return option.value === props.modelValue;
}

/* ------------------------------------------------------------------ *
 * Positioning
 * ------------------------------------------------------------------ */

const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 6;
const MIN_MENU_HEIGHT = 140;

/**
 * Places the menu in viewport coordinates with full collision handling:
 * flips above the trigger when there is more room there, clamps horizontally so
 * it can never run off either edge, and caps its height to the space actually
 * available (the menu scrolls internally past that).
 *
 * This is what makes long option labels safe: the menu is free to be wider than
 * its trigger, but is always bounded by the viewport rather than by an
 * ancestor's width or overflow.
 */
function updatePosition() {
  const trigger = triggerRef.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;

  const spaceBelow = viewportHeight - rect.bottom - TRIGGER_GAP - VIEWPORT_MARGIN;
  const spaceAbove = rect.top - TRIGGER_GAP - VIEWPORT_MARGIN;
  // Prefer below unless it is genuinely cramped and there is more room above.
  const placeBelow = spaceBelow >= MIN_MENU_HEIGHT || spaceBelow >= spaceAbove;

  const available = viewportWidth - VIEWPORT_MARGIN * 2;
  const width = Math.min(Math.max(rect.width, 200), available);

  let left = rect.left;
  if (left + width > viewportWidth - VIEWPORT_MARGIN) {
    left = viewportWidth - VIEWPORT_MARGIN - width;
  }
  left = Math.max(VIEWPORT_MARGIN, left);

  menuStyle.value = {
    left: `${Math.round(left)}px`,
    minWidth: `${Math.round(width)}px`,
    // Bounded by the distance to the right edge, so the menu cannot overflow
    // however long an option label is - it wraps or scrolls instead.
    maxWidth: `${Math.round(viewportWidth - VIEWPORT_MARGIN - left)}px`,
    maxHeight: `${Math.round(Math.max(MIN_MENU_HEIGHT, placeBelow ? spaceBelow : spaceAbove))}px`,
    ...(placeBelow
      ? { top: `${Math.round(rect.bottom + TRIGGER_GAP)}px` }
      : { bottom: `${Math.round(viewportHeight - rect.top + TRIGGER_GAP)}px` }),
  };
}

/* ------------------------------------------------------------------ *
 * Open / close
 * ------------------------------------------------------------------ */

async function openMenu(preferredIndex?: number) {
  if (props.disable || open.value) return;

  open.value = true;
  activeIndex.value = preferredIndex ?? (selectedIndex.value >= 0 ? selectedIndex.value : 0);

  await nextTick();
  updatePosition();
  scrollActiveIntoView();

  // `capture` catches scrolling on any ancestor, not just the window, so the
  // menu tracks its trigger instead of detaching from it.
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
  document.addEventListener('pointerdown', onPointerDown, true);
}

function closeMenu(returnFocus = true) {
  if (!open.value) return;

  open.value = false;
  activeIndex.value = -1;
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
  document.removeEventListener('pointerdown', onPointerDown, true);

  if (returnFocus) triggerRef.value?.focus();
}

function toggle() {
  if (open.value) closeMenu();
  else void openMenu();
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as Node;
  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) return;
  closeMenu(false); // clicking elsewhere should not yank focus back
}

function choose(option: AppSelectOption) {
  emit('update:modelValue', option.value);
  closeMenu();
}

function clear() {
  emit('update:modelValue', null);
  if (open.value) closeMenu();
}

function scrollActiveIntoView() {
  optionRefs.value[activeIndex.value]?.scrollIntoView({ block: 'nearest' });
}

function moveActive(delta: number) {
  const count = props.options.length;
  if (count === 0) return;
  activeIndex.value = (activeIndex.value + delta + count) % count;
  void nextTick(scrollActiveIntoView);
}

function setActive(index: number) {
  if (props.options.length === 0) return;
  activeIndex.value = index;
  void nextTick(scrollActiveIntoView);
}

/* ------------------------------------------------------------------ *
 * Typeahead
 * ------------------------------------------------------------------ */

let typeaheadBuffer = '';
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

function typeahead(char: string) {
  if (typeaheadTimer) clearTimeout(typeaheadTimer);
  typeaheadBuffer += char.toLowerCase();
  typeaheadTimer = setTimeout(() => {
    typeaheadBuffer = '';
  }, 600);

  const match = props.options.findIndex((option) =>
    option.label.toLowerCase().startsWith(typeaheadBuffer),
  );
  if (match === -1) return;

  if (open.value) setActive(match);
  else emit('update:modelValue', props.options[match]!.value);
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disable) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (open.value) moveActive(1);
      else void openMenu();
      return;
    case 'ArrowUp':
      event.preventDefault();
      if (open.value) moveActive(-1);
      else void openMenu(props.options.length - 1);
      return;
    case 'Home':
      if (!open.value) return;
      event.preventDefault();
      setActive(0);
      return;
    case 'End':
      if (!open.value) return;
      event.preventDefault();
      setActive(props.options.length - 1);
      return;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (!open.value) {
        void openMenu();
      } else if (activeIndex.value >= 0 && props.options[activeIndex.value]) {
        choose(props.options[activeIndex.value]!);
      }
      return;
    case 'Escape':
      if (!open.value) return;
      event.preventDefault();
      closeMenu();
      return;
    case 'Tab':
      // Let focus move on naturally, but do not leave an orphaned menu behind.
      closeMenu(false);
      return;
    default:
      // Printable single characters drive typeahead; modifier combos do not.
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        typeahead(event.key);
      }
  }
}

// If the option list changes underneath an open menu (e.g. the city list after
// switching area), a stale active index would point at nothing.
watch(
  () => props.options,
  () => {
    if (!open.value) return;
    activeIndex.value = Math.min(activeIndex.value, Math.max(props.options.length - 1, 0));
    void nextTick(updatePosition);
  },
);

onBeforeUnmount(() => {
  if (typeaheadTimer) clearTimeout(typeaheadTimer);
  closeMenu(false);
});
</script>

<style lang="scss" scoped>
.app-select {
  position: relative;
  display: block;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 56px;
  padding: 0.5rem 0.875rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--border-hover);
  }

  &:focus-visible,
  &.select-trigger--open {
    outline: none;
    border-color: var(--q-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--q-primary) 16%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
}

.select-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  color: var(--text-subtle);
}

.select-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0; // lets the value ellipsize instead of stretching the trigger
}

.select-label {
  font-size: 1rem;
  color: var(--text-subtle);
  transition:
    font-size 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &--floated {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
}

.select-trigger--open .select-label {
  color: var(--q-primary);
}

.select-value {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-clear,
.select-arrow {
  flex-shrink: 0;
  color: var(--text-subtle);
}

.select-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--q-primary) 12%, transparent);
    color: inherit;
  }
}

.select-arrow {
  font-size: 1.25rem;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-trigger--open .select-arrow {
  transform: rotate(180deg);
  color: var(--q-primary);
}
</style>

<style lang="scss">
/* Unscoped: the menu is teleported to <body>, so scoped attributes would not
   reach it. Class names are namespaced to keep this contained. */
.select-menu {
  position: fixed;
  z-index: 7000;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.375rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface-card);
  backdrop-filter: blur(20px);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
  animation: select-menu-in 0.14s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes select-menu-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .select-menu {
    animation: none;
  }
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.select-option-label {
  // Long labels wrap inside the bounded menu rather than forcing it wider.
  overflow-wrap: anywhere;
}

.select-option--active {
  background: color-mix(in srgb, var(--q-primary) 12%, transparent);
}

.select-option--selected {
  font-weight: 600;
  color: var(--q-primary);
}

.select-empty {
  margin: 0;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style>
