<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>

    <main>
      <HeroSection :title="t('about.heroTitle')" :description="t('about.heroDescription')" class="q-py-xl">
        <template #prepend>
          <div class="hero-badge q-mb-md">
            <q-icon name="bolt" size="40px" color="primary" />
          </div>
        </template>
      </HeroSection>

      <div class="content-container">
        <q-card class="about-card q-mb-lg">
          <q-card-section>
            <h2 class="text-h5 q-mb-md">
              <q-icon name="info" size="sm" class="q-mr-sm" />
              {{ t('about.whatIsTitle') }}
            </h2>
            <p class="text-body1 lede">
              {{ t('about.whatIsBody') }}
            </p>
          </q-card-section>
        </q-card>

        <h2 class="text-h5 q-mb-lg section-heading">
          <q-icon name="stars" size="sm" class="q-mr-sm" />
          {{ t('about.featuresTitle') }}
        </h2>

        <div class="features-grid q-mb-xl">
          <q-card class="feature-card">
            <q-card-section>
              <div class="feature-icon feature-icon--primary">
                <q-icon name="analytics" size="24px" />
              </div>
              <h3 class="text-h6 q-mt-md q-mb-sm">{{ t('about.monitoring.title') }}</h3>
              <ul class="feature-list">
                <li v-for="item in i18n.tm('about.monitoring.items')" :key="item">{{ item }}</li>
              </ul>
            </q-card-section>
          </q-card>

          <q-card class="feature-card">
            <q-card-section>
              <div class="feature-icon feature-icon--secondary">
                <q-icon name="notifications_active" size="24px" />
              </div>
              <h3 class="text-h6 q-mt-md q-mb-sm">{{ t('about.alerts.title') }}</h3>
              <ul class="feature-list">
                <li v-for="item in i18n.tm('about.alerts.items')" :key="item">{{ item }}</li>
              </ul>
            </q-card-section>
          </q-card>

          <q-card class="feature-card">
            <q-card-section>
              <div class="feature-icon feature-icon--accent">
                <q-icon name="tune" size="24px" />
              </div>
              <h3 class="text-h6 q-mt-md q-mb-sm">{{ t('about.tools.title') }}</h3>
              <ul class="feature-list">
                <li v-for="item in i18n.tm('about.tools.items')" :key="item">{{ item }}</li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-7">
            <q-card class="about-card">
              <q-card-section>
                <h2 class="text-h5 q-mb-md">
                  <q-icon name="code" size="sm" class="q-mr-sm" />
                  {{ t('about.architectureTitle') }}
                </h2>

                <div class="tech-group q-mb-lg">
                  <h3 class="tech-label">
                    <q-icon name="web" size="18px" />
                    {{ t('about.frontend') }}
                  </h3>
                  <div class="tech-chips">
                    <span class="tech-chip">Vue.js 3</span>
                    <span class="tech-chip">Quasar</span>
                    <span class="tech-chip">TypeScript</span>
                    <span class="tech-chip">Chart.js</span>
                  </div>
                </div>

                <div class="tech-group">
                  <h3 class="tech-label">
                    <q-icon name="dns" size="18px" />
                    {{ t('about.backend') }}
                  </h3>
                  <div class="tech-chips">
                    <span class="tech-chip">Java</span>
                    <span class="tech-chip">Spring Boot</span>
                    <span class="tech-chip">REST API</span>
                    <span class="tech-chip">Maven</span>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-5">
            <q-card class="about-card q-mb-lg">
              <q-card-section>
                <h2 class="text-h6 q-mb-sm">{{ t('about.developerTitle') }}</h2>
                <i18n-t keypath="about.developerBody1" tag="p" class="text-body2 q-mb-sm" scope="global">
                  <template #author><strong>Emil Berglund</strong></template>
                </i18n-t>
                <p class="text-body2 q-mb-none">
                  {{ t('about.developerBody2') }}
                </p>
              </q-card-section>
            </q-card>

            <q-card class="about-card q-mb-lg">
              <q-card-section>
                <h2 class="text-h6 q-mb-sm">{{ t('about.openSourceTitle') }}</h2>
                <p class="text-body2 q-mb-md">
                  {{ t('about.openSourceBody') }}
                </p>
                <a href="https://github.com/EmilB04/VarsEL" target="_blank" rel="noopener noreferrer" class="pill-link">
                  <q-icon name="code" size="16px" />
                  {{ t('about.viewOnGithub') }}
                </a>
              </q-card-section>
            </q-card>

            <q-card class="about-card">
              <q-card-section>
                <h2 class="text-h6 q-mb-sm">{{ t('about.dataSourcesTitle') }}</h2>
                <p class="text-body2 q-mb-md">
                  {{ t('about.dataSourcesBody') }}
                </p>
                <a href="https://www.hvakosterstrommen.no/" target="_blank" rel="noopener noreferrer" class="pill-link pill-link--outline">
                  <q-icon name="link" size="16px" />
                  hvakosterstrommen.no
                </a>
                <p class="text-caption q-mt-md caption-muted">
                  {{ t('about.dataSourcesCaption') }}
                </p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </main>

    <footer class="q-mt-xl q-pb-lg">
      <FooterSection />
    </footer>
  </q-page>
</template>

<style lang="scss" scoped>

:deep(.hero-section) {
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.body--dark .hero-badge {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.content-container {
  max-width: 100%;
}

.about-card {
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: none;
  transition: border-color 0.3s ease;

  h2 {
    display: flex;
    align-items: center;
    font-weight: 700;
  }
}

.lede {
  opacity: 0.85;
  line-height: 1.7;
}

.section-heading {
  display: flex;
  align-items: center;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.feature-card {
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: none;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--border-hover);
  }
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: white;

  &--primary { background: var(--q-primary); }
  &--secondary { background: $secondary; }
  &--accent { background: $accent; }
}

.feature-list {
  list-style: none;
  padding-left: 0;
  margin: 0;

  li {
    padding: 0.375rem 0 0.375rem 1.25rem;
    position: relative;
    font-size: 0.9rem;
    opacity: 0.85;
    line-height: 1.4;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.9rem;
      width: 5px;
      height: 5px;
      border-radius: 9999px;
      background: var(--q-primary);
    }
  }
}

.tech-group {
  .tech-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.75rem;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-subtle);
  }
}

.tech-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-chip {
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--surface-card);
  font-size: 0.8rem;
  font-weight: 600;
}

.pill-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  background: var(--q-primary);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &.pill-link--outline {
    background: transparent;
    color: inherit;
    border: 1px solid var(--border);

    &:hover {
      border-color: var(--q-primary);
      color: var(--q-primary);
      opacity: 1;
    }
  }
}

.caption-muted {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import FooterSection from 'src/components/FooterSection.vue';
import HeroSection from 'src/components/HeroSection.vue';
import NavSection from 'src/components/NavSection.vue';

const { t } = useI18n();
const i18n = useI18n();
</script>
