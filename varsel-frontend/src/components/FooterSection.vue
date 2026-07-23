<template>
  <div class="modern-footer">
    <div class="footer-card">
      <p class="tagline">{{ t('footer.tagline') }}</p>

      <a
        href="https://github.com/EmilB04"
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
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
        <span>{{ t('footer.github') }}</span>
      </a>

      <p class="made-by">
        {{ t('footer.madeBy') }} <strong>Emil Berglund</strong>
        <span class="dot" aria-hidden="true">&bull;</span>
        <span>&copy; {{ new Date().getFullYear() }} VarsEL</span>
      </p>

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
          width="180"
          height="40"
          class="source-logo"
        />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.modern-footer {
  padding: 0 0 1.5rem;
  margin-top: 4rem;
}

.footer-card {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  text-align: center;
  padding: 1.75rem 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--surface);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  transition: border-color 0.3s ease;
}

.tagline {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.125rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  color: inherit;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--q-primary);
    color: var(--q-primary);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.made-by {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-muted);

  strong {
    color: inherit;
    font-weight: 700;
  }

  .dot {
    margin: 0 0.5rem;
  }
}

.data-source {
  margin-top: 0.25rem;
  text-decoration: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0.85;

  &:hover {
    transform: scale(1.05);
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
    gap: 1rem;
    border-radius: 20px;

    .tagline,
    .made-by {
      font-size: 0.75rem;
    }
  }
}
</style>
