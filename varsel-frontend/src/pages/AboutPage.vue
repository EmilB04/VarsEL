<template>
  <q-page class="app-page about-page">
    <HeroSection :title="t('about.heroTitle')" :description="t('about.heroDescription')" />

    <section aria-labelledby="about-features">
      <h2 id="about-features" class="table-heading">{{ t('about.featuresTitle') }}</h2>
      <div class="feature-grid">
        <router-link
          v-for="feature in features"
          :key="feature.to"
          :to="feature.to"
          :class="{ 'feature-card--today': feature.to === '/' }"
          class="glass-card feature-card"
          :aria-labelledby="`about-feature-${feature.key}`"
          :aria-describedby="`about-detail-${feature.key}`"
        >
          <q-icon :name="feature.icon" class="panel-icon feature-icon" aria-hidden="true" />
          <div class="feature-copy">
            <h3 :id="`about-feature-${feature.key}`">{{ t(`about.features.${feature.key}.title`) }}</h3>
            <p :id="`about-detail-${feature.key}`">{{ t(`about.features.${feature.key}.description`) }}</p>
          </div>
          <q-icon name="sym_o_arrow_forward" class="link-arrow" aria-hidden="true" />
          <ul v-if="feature.to === '/'" class="area-list" :aria-label="t('about.priceAreas')">
            <li v-for="area in priceAreas" :key="area">{{ area }}</li>
          </ul>
        </router-link>
      </div>
    </section>

    <div class="details-grid">
      <section class="glass-card details-card" aria-labelledby="about-sources">
        <h2 id="about-sources" class="table-heading">
          <q-icon name="sym_o_database" class="panel-icon" aria-hidden="true" />
          {{ t('about.dataSourcesTitle') }}
        </h2>
        <ul class="source-list">
          <li v-for="source in sources" :key="source.url">
            <a :href="source.url" target="_blank" rel="noopener noreferrer" class="detail-link">
              <q-icon :name="source.icon" class="field-icon" aria-hidden="true" />
              <span class="source-copy">
                <strong>{{ t(`about.sources.${source.key}.name`) }}</strong>
                <span>{{ t(`about.sources.${source.key}.description`) }}</span>
              </span>
              <q-icon name="sym_o_arrow_outward" class="link-arrow" aria-hidden="true" />
              <span class="sr-only"> {{ t('about.opensInNewTab') }}</span>
            </a>
          </li>
        </ul>
      </section>

      <section class="glass-card details-card" aria-labelledby="about-project">
        <h2 id="about-project" class="table-heading">
          <q-icon name="sym_o_code" class="panel-icon" aria-hidden="true" />
          {{ t('about.projectTitle') }}
        </h2>
        <i18n-t keypath="about.developerBody" tag="p" class="project-description" scope="global">
          <template #author><strong>Emil Berglund</strong></template>
        </i18n-t>
        <dl class="tech-stack">
          <div>
            <dt>{{ t('about.frontend') }}</dt>
            <dd>Vue.js 3, Quasar, TypeScript, Chart.js</dd>
          </div>
          <div>
            <dt>{{ t('about.backend') }}</dt>
            <dd>Java, Spring Boot, Maven</dd>
          </div>
        </dl>
        <a
          href="https://github.com/EmilB04/VarsEL"
          target="_blank"
          rel="noopener noreferrer"
          class="repository-link"
        >
          <span class="repository-label">{{ t('about.viewOnGithub') }}</span>
          <q-icon name="sym_o_arrow_outward" class="link-arrow" aria-hidden="true" />
          <span class="sr-only"> {{ t('about.opensInNewTab') }}</span>
        </a>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import HeroSection from 'src/components/HeroSection.vue';
import { AREA_CODES } from 'src/scripts/TableScript';

const { t } = useI18n();
const priceAreas = AREA_CODES;
const features = [
  { key: 'today', to: '/', icon: 'sym_o_bolt' },
  { key: 'history', to: '/history', icon: 'sym_o_history' },
  { key: 'notifications', to: '/notifications', icon: 'sym_o_notifications' },
] as const;

const sources = [
  { key: 'prices', url: 'https://www.hvakosterstrommen.no/', icon: 'sym_o_bolt' },
  {
    key: 'location',
    url: 'https://gis3.nve.no/map/rest/services/Mapservices/Omradekonsesjoner/MapServer/8',
    icon: 'sym_o_map',
  },
] as const;
</script>

<style lang="scss" scoped>
.about-page {
  --about-gap: clamp(10px, 1.5vw, 18px);
  --about-panel-padding: clamp(12px, 2vw, 22px);
  color: var(--app-ink);
}
.about-page h2 {
  margin: 0 0 10px;
}
.feature-grid,
.details-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: var(--about-gap);
}
.feature-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px 12px;
  padding: var(--about-panel-padding);
  color: inherit;
  text-decoration: none;
}
.feature-card--today {
  grid-row: span 2;
  grid-template-rows: auto 1fr;
  border-color: var(--accent-edge);
  background: color-mix(in srgb, var(--surface-card) 68%, var(--surface-inset));
}
.feature-copy h3 {
  margin: 0;
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 700;
  line-height: 1.25;
}
.feature-card--today h3 {
  font-size: clamp(1.18rem, 2.6vw, 1.8rem);
}
.feature-copy p,
.project-description {
  max-width: 58ch;
  margin: 4px 0 0;
  color: var(--text-subtle);
  font-size: 0.94rem;
  line-height: 1.5;
}
.link-arrow {
  flex: none;
  font-size: 18px;
  color: var(--text-subtle);
}
.feature-card .link-arrow {
  margin-top: 7px;
}
.area-list {
  grid-column: 2 / -1;
  align-self: end;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.area-list li {
  padding: 3px 6px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface-card);
  color: var(--text-subtle);
  font: 500 0.74rem / 1.2 var(--data-font);
}
.details-grid {
  margin-top: var(--about-gap);
}
.details-card {
  min-width: 0;
  padding: var(--about-panel-padding);
}
.source-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.source-list li + li {
  border-top: 1px solid var(--border);
}
.detail-link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 44px;
  padding: 9px 4px;
  color: inherit;
  text-decoration: none;
}
.source-copy {
  display: grid;
  gap: 2px;
  overflow-wrap: anywhere;
}
.source-copy strong {
  font-size: 0.94rem;
}
.source-copy span {
  color: var(--text-subtle);
  font-size: 0.86rem;
}
.tech-stack {
  display: grid;
  gap: 9px;
  margin: 12px 0 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--border);
  font-size: 0.86rem;
}
.tech-stack div {
  display: grid;
  grid-template-columns: minmax(72px, 5.5rem) minmax(0, 1fr);
  gap: 8px;
}
.tech-stack dt {
  font-weight: 650;
}
.tech-stack dd {
  margin: 0;
  color: var(--text-subtle);
}
.repository-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  color: inherit;
  font-weight: 650;
  text-decoration: none;
}
.repository-label {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.detail-link:focus-visible {
  border-radius: 8px;
  outline-offset: -2px;
}
.feature-card:focus-visible {
  border-color: var(--border-hover);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (hover: hover) {
  .feature-card:hover {
    border-color: var(--border-hover);
    background: var(--surface);
  }
  .detail-link:hover strong {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .repository-link:hover {
    color: var(--text-subtle);
  }
}
@media (max-width: 640px) {
  .feature-grid,
  .details-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .feature-card--today {
    grid-row: auto;
  }
}
</style>
