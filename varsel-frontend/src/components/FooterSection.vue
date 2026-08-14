<template>
  <div class="modern-footer">
    <div class="footer-card">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="brand-mark" aria-hidden="true">
            <q-icon name="bolt" size="18px" aria-hidden="true" />
          </span>
          <div class="brand-copy">
            <p class="brand-name">VarsEL</p>
            <p class="tagline">{{ t('footer.tagline') }}</p>
          </div>
        </div>

        <nav class="footer-links" :aria-label="t('footer.linksLabel')">
          <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="footer-link">
            {{ item.label }}
          </router-link>
        </nav>

        <div class="footer-status" role="status">
          <span class="status-dot" :class="`status-dot--${statusTone}`" aria-hidden="true"></span>
          <span class="status-text">{{ statusLabel }}</span>
          <template v-if="lastUpdatedLabel">
            <span class="status-sep" aria-hidden="true">&bull;</span>
            <span class="status-text">{{ lastUpdatedLabel }}</span>
          </template>
        </div>
      </div>

      <div class="footer-divider" role="separator" aria-hidden="true"></div>

      <div class="footer-bottom">
        <p class="legal">
          &copy; {{ year }} VarsEL
          <span class="dot" aria-hidden="true">&bull;</span>
          {{ t('footer.version', { version: appVersion }) }}
          <span class="dot" aria-hidden="true">&bull;</span>
          <i18n-t keypath="footer.madeBy" tag="span" scope="global">
            <template #author><strong>Emil Berglund</strong></template>
          </i18n-t>
        </p>

        <div class="footer-actions">
          <a
            href="https://github.com/EmilB04"
            target="_blank"
            rel="noopener noreferrer"
            class="icon-link"
            :aria-label="t('footer.github')"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01
                1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27
                2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
                0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01
                8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>

          <a
            href="https://www.hvakosterstrommen.no"
            target="_blank"
            rel="noopener noreferrer"
            class="data-source"
            :title="t('footer.dataSourceAlt')"
          >
            <img
              src="https://i.bnfcl.io/hva-koster-strommen/strompriser-levert-av-hvakosterstrommen_oTtWvqeiB.png"
              :alt="t('footer.dataSourceAlt')"
              width="140"
              height="31"
              loading="lazy"
              class="source-logo"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBackendStatus } from 'src/composables/useBackendStatus';
import { formatMinutesOfDay, getOsloParts } from 'src/scripts/osloTime';
import { version as appVersion } from '../../package.json';

const { t } = useI18n();
const { state: backendState, lastSuccessAt } = useBackendStatus();

const year = new Date().getFullYear();

const navItems = computed(() => [
  { to: '/', label: t('nav.today') },
  { to: '/history', label: t('nav.history') },
  { to: '/notifications', label: t('nav.notifications') },
  { to: '/about', label: t('nav.about') },
]);

// A quiet, permanent status readout - distinct from BackendStatusBar's
// transient pill, which only appears during a cold start or an error and
// auto-dismisses once connected.
const statusTone = computed(() => {
  switch (backendState.value) {
    case 'ready':
      return 'positive';
    case 'waking':
      return 'pending';
    case 'error':
      return 'negative';
    default:
      return 'muted';
  }
});

const statusLabel = computed(() => {
  switch (backendState.value) {
    case 'ready':
      return t('footer.status.connected');
    case 'waking':
      return t('footer.status.connecting');
    case 'error':
      return t('footer.status.offline');
    default:
      return t('footer.status.unknown');
  }
});

const lastUpdatedLabel = computed(() => {
  if (lastSuccessAt.value === null) return null;
  const { hour, minute } = getOsloParts(new Date(lastSuccessAt.value));
  return t('footer.status.lastUpdated', { time: formatMinutesOfDay(hour * 60 + minute) });
});
</script>

<style lang="scss" scoped>
.modern-footer {
  padding: 0 0 1.5rem;
  margin-top: 4rem;
}

.footer-card {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--surface);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  transition: border-color 0.3s ease;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.5rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--q-primary);
  color: white;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.brand-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
}

.tagline {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
}

.footer-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-subtle);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: var(--q-primary);
  }

  &.router-link-active {
    color: var(--q-primary);
  }
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-subtle);
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  flex-shrink: 0;
  background: var(--text-muted);

  &--positive {
    background: $positive;
    box-shadow: 0 0 0 3px color-mix(in srgb, $positive 25%, transparent);
  }

  &--pending {
    background: $warning;
    animation: status-dot-pulse 1.4s ease-in-out infinite;
  }

  &--negative {
    background: $negative;
  }
}

@keyframes status-dot-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-dot--pending {
    animation: none;
  }
}

.status-sep {
  opacity: 0.6;
}

.footer-divider {
  height: 1px;
  margin: 1rem 0;
  background: var(--border);
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
}

.legal {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);

  strong {
    color: inherit;
    font-weight: 700;
  }

  .dot {
    margin: 0 0.4rem;
  }
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    border-color: var(--q-primary);
    color: var(--q-primary);
  }
}

.data-source {
  display: flex;
  text-decoration: none;
  opacity: 0.85;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus-visible {
    opacity: 1;
  }

  .source-logo {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@media (max-width: 768px) {
  .footer-card {
    padding: 1.125rem 1.25rem;
    border-radius: 20px;
  }

  .footer-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
