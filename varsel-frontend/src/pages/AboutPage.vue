<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>

    <main>
      <HeroSection title="Om VarsEL" description="Din smarte partner for strømforbruk">
      <template #prepend>
        <div class="hero-icon q-mb-md">
        <q-icon name="bolt" size="80px" color="primary" />
        </div>
      </template>
      </HeroSection>

      <div class="content-container">
        <div class="row q-gutter-xl">
          <div class="col-12 col-md-7">
            <q-card class="info-card glass-card q-mb-lg">
              <q-card-section>
                <h2 class="text-h5 q-mb-md">
                  <q-icon name="info" size="sm" class="q-mr-sm" />
                  Hva er VarsEL?
                </h2>
                <p class="text-body1">
                  VarsEL er en moderne webapplikasjon som gir deg full kontroll over strømforbruket ditt.
                  Med sanntidsdata fra hele Norge kan du overvåke strømpriser, analysere pristrender og
                  motta smarte varsler når prisene når ønskede nivåer. Applikasjonen kombinerer kraftig
                  datavisualisering med praktiske verktøy for å hjelpe deg med å spare penger på strømregningen.
                </p>
              </q-card-section>
            </q-card>

            <q-card class="info-card glass-card q-mb-lg">
              <q-card-section>
                <h2 class="text-h5 q-mb-md">
                  <q-icon name="stars" size="sm" class="q-mr-sm" />
                  Hovedfunksjoner
                </h2>

                <div class="feature-group q-mb-lg">
                  <h3 class="text-h6 feature-title">
                    <q-icon name="analytics" color="primary" class="q-mr-sm" />
                    Prisovervåking og visualisering
                  </h3>
                  <ul class="feature-list">
                    <li>Sanntidsdata fra alle norske prisområder (NO1-NO5)</li>
                    <li>Interaktive diagrammer med min/maks/gjennomsnittspriser</li>
                    <li>Detaljerte tabeller med timespriser</li>
                    <li>Nåværende pris-indikator for umiddelbar oversikt</li>
                  </ul>
                </div>

                <div class="feature-group q-mb-lg">
                  <h3 class="text-h6 feature-title">
                    <q-icon name="notifications_active" color="secondary" class="q-mr-sm" />
                    Smarte varselsystemer
                  </h3>
                  <ul class="feature-list">
                    <li>Prisvarsler når strømmen når bestemte nivåer</li>
                    <li>Billigste time-varsler for optimal planlegging</li>
                    <li>Tilpassbare varslingstidspunkter</li>
                    <li>Lokale lagrede innstillinger</li>
                  </ul>
                </div>

                <div class="feature-group">
                  <h3 class="text-h6 feature-title">
                    <q-icon name="tune" color="accent" class="q-mr-sm" />
                    Avanserte verktøy
                  </h3>
                  <ul class="feature-list">
                    <li>Tidsintervall-filtrering for spesifikke timer</li>
                    <li>MVA-kalkulator (inkludert/ekskludert)</li>
                    <li>Mørk/lys modus for bedre brukeropplevelse</li>
                    <li>Responsivt design for alle enheter</li>
                  </ul>
                </div>
              </q-card-section>
            </q-card>

            <q-card class="info-card glass-card">
              <q-card-section>
                <h2 class="text-h5 q-mb-md">
                  <q-icon name="code" size="sm" class="q-mr-sm" />
                  Teknisk arkitektur
                </h2>

                <div class="row q-gutter-md">
                  <div class="col-12 col-sm-5">
                    <div class="tech-stack">
                      <h3 class="text-h6 tech-title">
                        <q-icon name="web" color="primary" />
                        Frontend
                      </h3>
                      <q-list dense>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>Vue.js 3 med Composition API</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>Quasar Framework</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>TypeScript</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>Chart.js</q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>

                  <div class="col-12 col-sm-5">
                    <div class="tech-stack">
                      <h3 class="text-h6 tech-title">
                        <q-icon name="dns" color="secondary" />
                        Backend
                      </h3>
                      <q-list dense>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>Java Spring Boot</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>REST API</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>Maven</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </q-item-section>
                          <q-item-section>JSON API</q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card class="sidebar-card glass-card q-mb-lg">
              <q-card-section>
                <h2 class="text-h5 q-mb-md text-left">Om utvikleren</h2>
                <p class="text-body2">
                  VarsEL er utviklet av <strong>Emil Berglund</strong> som et
                  personlig prosjekt for å sette sin kunnskap på prøve, og lær mer om fullstack-utvikling.
                </p>
                <p class="text-body2">
                  Prosjektet kombinerer moderne webutvikling med praktisk nytte, og demonstrerer
                  fullstack-utvikling med Java og Vue.js.
                </p>
              </q-card-section>
            </q-card>

            <q-card class="sidebar-card glass-card q-mb-lg">
              <q-card-section>
                <h2 class="text-h5 q-mb-md text-left">Åpen kildekode</h2>
                <p class="text-body2 q-mb-md text-left">
                  VarsEL er åpen kildekode og tilgjengelig på GitHub. Bidrag og forslag er velkommen!
                </p>
                <q-btn
                  label="Se på GitHub"
                  color="primary"
                  href="https://github.com/EmilB04/VarsEL"
                  target="_blank"
                  icon="code"
                  class="full-width"
                  unelevated
                  rounded
                />
              </q-card-section>
            </q-card>

            <q-card class="sidebar-card glass-card">
              <q-card-section class="text-left">
                <h2 class="text-h5 q-mb-md text-left">Datakilder</h2>
                <p class="text-body2 q-mb-md">
                  Strømpriser hentes fra:
                </p>
                <q-btn
                  label="hvakosterstrommen.no"
                  icon="link"
                  color="secondary"
                  href="https://www.hvakosterstrommen.no/"
                  target="_blank"
                  outline
                  rounded
                  no-caps
                />
                <p class="text-caption q-mt-md text-grey-6">
                  En tjeneste fra Beneficial Apps AS
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
  padding: 3rem 0;

  .hero-icon {
    animation: pulse 2s infinite;
  }

  .text-h4 {
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.content-container {
  max-width: 100%;
}

.info-card,
.sidebar-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  h2 {
    display: flex;
    align-items: center;
    font-weight: 700;
  }
}

.feature-group {
  .feature-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .feature-list {
    list-style: none;
    padding-left: 0;

    li {
      padding: 0.5rem 0 0.5rem 2rem;
      position: relative;

      &:before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #10B981;
        font-weight: bold;
        font-size: 1.2rem;
      }
    }
  }
}

.tech-stack {
  .tech-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
}

.dev-icon {
  background: linear-gradient(135deg, #00D9C0, #6366F1);
  border-radius: 50%;
  padding: 1rem;
  color: white;
}

@media (max-width: 768px) {
  :deep(.hero-section) {
    padding: 2rem 0;

    .hero-icon .q-icon {
      font-size: 60px;
    }
  }
}
</style>

<script setup lang="ts">
import FooterSection from 'src/components/FooterSection.vue';
import HeroSection from 'src/components/HeroSection.vue';
import NavSection from 'src/components/NavSection.vue';
</script>
