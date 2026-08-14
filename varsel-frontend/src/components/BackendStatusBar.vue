<template>
  <!--
    Pinned to the bottom of the viewport rather than placed in the page flow.

    The cold-start notice previously sat below the chart and table, so on the
    pages where it matters most the user had to scroll past a loading skeleton
    to discover the app was waiting on the backend. A fixed bar is visible
    immediately regardless of scroll position, and - unlike a top banner - it
    cannot push the hero and chart down and reflow the layout at the exact
    moment the chart is being drawn.

    When idle the element is not rendered at all, so it can neither obscure
    content nor intercept pointer events.
  -->
  <Transition name="status-bar">
    <div v-if="visible" class="backend-status" :class="`backend-status--${state}`">
      <!-- Polite live region: the state change is announced without
           interrupting whatever the screen reader is currently saying. -->
      <div class="status-inner" role="status" aria-live="polite">
        <q-spinner v-if="state === 'waking'" size="18px" class="status-icon" aria-hidden="true" />
        <q-icon
          v-else
          :name="state === 'error' ? 'error' : 'check_circle'"
          size="18px"
          class="status-icon"
          aria-hidden="true"
        />

        <span class="status-text">{{ message }}</span>

        <button type="button" class="status-close" :aria-label="t('common.close')" @click="dismiss">
          <q-icon name="close" size="16px" aria-hidden="true" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBackendStatus } from 'src/composables/useBackendStatus';
import { formatCountdown } from 'src/scripts/useBackendRequest';

const { t } = useI18n();
const { state, visible, countdownSeconds, dismiss } = useBackendStatus();

const message = computed(() => {
  if (state.value === 'error') return t('backendStatus.error');
  if (state.value === 'ready') return t('backendStatus.ready');
  return t('backendStatus.waking', { countdown: formatCountdown(countdownSeconds.value) });
});
</script>

<style lang="scss" scoped>
.backend-status {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2500;
  display: flex;
  justify-content: center;
  padding: 0 0.75rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
  pointer-events: none; // only the bar itself is interactive, not the full-width strip
}

.status-inner {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  max-width: min(100%, 34rem);
  padding: 0.5rem 0.5rem 0.5rem 0.875rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--surface-card);
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  font-size: 0.85rem;
  font-weight: 500;
}

.status-icon {
  flex-shrink: 0;
  color: var(--q-primary);
}

.backend-status--error .status-icon {
  color: $negative;
}

.backend-status--ready .status-icon {
  color: $positive;
}

.status-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--text-subtle);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: var(--surface);
    color: inherit;
  }
}

// Clears the fixed bottom tab bar on mobile (see NavSection.vue).
@media (max-width: 868px) {
  .backend-status {
    bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    padding-bottom: 0.5rem;
  }
}

.status-bar-enter-active,
.status-bar-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-bar-enter-from,
.status-bar-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}

@media (prefers-reduced-motion: reduce) {
  .status-bar-enter-active,
  .status-bar-leave-active {
    transition: none;
  }
}
</style>
