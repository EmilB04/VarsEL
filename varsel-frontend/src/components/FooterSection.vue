<template>
  <footer class="app-footer">
    <div class="footer-card">
      <div class="footer-main">
        <div class="footer-identity">
          <BrandLink />
          <div v-if="backendState !== 'unknown'" class="footer-status">
            <span class="status-dot" :class="`status-dot--${statusTone}`" aria-hidden="true"></span>
            <span>{{ statusLabel }}</span>
            <span v-if="lastUpdatedLabel" class="footer-refresh">{{ lastUpdatedLabel }}</span>
          </div>
        </div>

        <a
          href="https://www.hvakosterstrommen.no"
          target="_blank"
          rel="noopener noreferrer"
          class="data-source"
        >
          <img
            src="https://i.bnfcl.io/hva-koster-strommen/strompriser-levert-av-hvakosterstrommen_oTtWvqeiB.png"
            :alt="t('footer.dataSourceAlt')"
            width="140"
            height="31"
            loading="lazy"
          />
        </a>
      </div>

      <div class="footer-meta">
        <p>
          &copy; {{ year }} VarsEL <span aria-hidden="true">·</span>
          {{ t('footer.version', { version: appVersion }) }}
        </p>
        <p>
          <i18n-t keypath="footer.madeBy" tag="span" scope="global">
            <template #author><strong>Emil Berglund</strong></template>
          </i18n-t>
        </p>
        <a
          href="https://github.com/EmilB04/VarsEL"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          :aria-label="t('footer.github')"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01
                1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27
                2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
                0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01
                8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
            />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBackendStatus } from 'src/composables/useBackendStatus';
import { formatMinutesOfDay, getOsloParts } from 'src/scripts/osloTime';
import { version as appVersion } from '../../package.json';
import BrandLink from './BrandLink.vue';

const { t } = useI18n();
const { state: backendState, lastSuccessAt } = useBackendStatus();

const year = new Date().getFullYear();

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
.app-footer {
  width: 100%;
  max-width: var(--app-width);
  margin: clamp(30px, 6vw, 66px) auto 0;
  padding-inline-start: max(var(--page-gutter), env(safe-area-inset-left));
  padding-inline-end: max(var(--page-gutter), env(safe-area-inset-right));
}
.footer-card {
  display: grid;
  gap: 12px;
  padding: clamp(12px, 2.4vw, 22px);
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--surface-card);
  box-shadow: var(--panel-shadow);
}
.footer-main,
.footer-identity,
.footer-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
}
.footer-main {
  justify-content: space-between;
}
.footer-identity :deep(.brand-link) {
  font-size: 1.06rem;
}
.footer-identity :deep(img) {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}
.footer-status {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px 8px;
  min-height: 30px;
  padding: 3px 9px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-subtle);
  font-size: 0.75rem;
  font-weight: 600;
}
.footer-refresh {
  color: var(--text-muted);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}
.status-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--text-muted);
}
.status-dot--positive {
  background: #078657;
}
.status-dot--pending {
  background: #b87512;
}
.status-dot--negative {
  background: #d44851;
}
.data-source,
.github-link {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  min-height: 44px;
  padding-inline: 8px;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
}
.data-source img {
  display: block;
  max-width: 100%;
  height: auto;
}
.data-source:hover,
.github-link:hover {
  color: var(--q-primary);
  background: var(--accent-soft);
}
.footer-meta {
  min-height: 44px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  color: var(--text-subtle);
  font-size: 0.8rem;
}
.footer-meta p {
  margin: 0;
}
.github-link {
  margin-inline-start: auto;
  font-weight: 650;
}
@media (max-width: 540px) {
  .footer-identity {
    flex-basis: 100%;
  }
  .footer-meta {
    column-gap: 8px;
  }
  .footer-meta p:nth-child(2) {
    flex-basis: 100%;
    order: 1;
  }
}
</style>
