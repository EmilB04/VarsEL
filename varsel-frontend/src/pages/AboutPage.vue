<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
      <h1 class="text-h3 text-center">Om VarsEL</h1>
    </header>
    <main>
      <div class="row q-gutter-lg">
        <div class="col-md-8 col-sm-12">
          <article class="q-mb-lg">
            <h2 class="text-h4 q-mb-md">🔌 Hva er VarsEL?</h2>
            <p class="text-body1">
              VarsEL er en moderne webapplikasjon som gir deg full kontroll over strømforbruket ditt. Med sanntidsdata fra hele Norge kan du overvåke strømpriser, analysere pristrender og motta smarte varsler når prisene når ønskede nivåer. Applikasjonen kombinerer kraftig datavisualisering med praktiske verktøy for å hjelpe deg med å spare penger på strømregningen.
            </p>
          </article>

          <article class="q-mb-lg">
            <h2 class="text-h4 q-mb-md">⚡ Hovedfunksjoner</h2>
            <div class="q-mb-md">
              <h3 class="text-h6">📊 Prisovervåking og visualisering</h3>
              <ul class="text-body1">
                <li>Sanntidsdata fra alle norske prisområder (NO1-NO5)</li>
                <li>Interaktive diagrammer med min/maks/gjennomsnittspriser</li>
                <li>Detaljerte tabeller med timespriser</li>
                <li>Nåværende pris-indikator for umiddelbar oversikt</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <h3 class="text-h6">🔔 Smarte varselsystemer</h3>
              <ul class="text-body1">
                <li>Prisvarsler når strømmen når bestemte nivåer</li>
                <li>Billigste time-varsler for optimal planlegging</li>
                <li>Tilpassbare varslingstidspunkter</li>
                <li>Lokale lagrede innstillinger</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <h3 class="text-h6">🎯 Avanserte verktøy</h3>
              <ul class="text-body1">
                <li>Tidsintervall-filtrering for spesifikke timer</li>
                <li>MVA-kalkulator (inkludert/ekskludert)</li>
                <li>Mørk/lys modus for bedre brukeropplevelse</li>
                <li>Responsivt design for alle enheter</li>
              </ul>
            </div>
          </article>

          <article class="q-mb-lg">
            <h2 class="text-h4 q-mb-md">🛠️ Teknisk arkitektur</h2>
            <div class="row q-gutter-md">
              <div class="col-md-6 col-sm-12">
                <h3 class="text-h6">Frontend</h3>
                <ul class="text-body1">
                  <li>Vue.js 3 med Composition API</li>
                  <li>Quasar Framework for UI-komponenter</li>
                  <li>TypeScript for type-sikkerhet</li>
                  <li>Chart.js for datavisualisering</li>
                </ul>
              </div>
              <div class="col-md-6 col-sm-12">
                <h3 class="text-h6">Backend</h3>
                <ul class="text-body1">
                  <li>Java Spring Boot REST API</li>
                  <li>Integrering med hvakosterstrommen.no</li>
                  <li>JSON-formatering og databehandling</li>
                  <li>Maven for prosjektbygging</li>
                </ul>
              </div>
            </div>
          </article>
        </div>

        <div class="col-sm-12 col-md-3">
          <div class="flex row justify-center flex-wrap q-gutter-md">
            <q-card class="q-mb-lg" style="flex: 1 1 45%; min-width: 280px;">
              <q-card-section>
                <h2 class="text-h5 q-mb-md">👨‍💻 Om utvikleren</h2>
                <p class="text-body1">
                  VarsEL er utviklet av <strong>Emil Berglund</strong> som et personlig prosjekt for å sette sin kunnskap på prøve, og lær mer om fullstack-utvikling.
                </p>
                <p class="text-body1">
                  Prosjektet kombinerer moderne webutvikling med praktisk nytte, og demonstrerer fullstack-utvikling med Java og Vue.js.
                </p>
              </q-card-section>
            </q-card>

            <q-card class="q-mb-lg" style="flex: 1 1 45%; min-width: 280px;">
              <q-card-section>
                <h2 class="text-h5 q-mb-md">🌐 Åpen kildekode</h2>
                <p class="text-body1">
                  VarsEL er åpen kildekode og tilgjengelig på GitHub. Bidrag og forslag er velkommen!
                </p>
                <q-btn
                  label="Se på GitHub"
                  icon="open_in_new"
                  color="primary"
                  href="https://github.com/EmilB04/VarsEL"
                  target="_blank"
                  no-caps
                  class="full-width"
                />
              </q-card-section>
            </q-card>

            <q-card class="text-center" style="flex: 1 1 100%; min-width: 280px; max-width: 800px;">
              <q-card-section>
                <h2 class="text-h5 q-mb-md">🔗 Datakilder</h2>
                <p class="text-body2">
                  Strømpriser hentes fra:
                </p>
                <q-btn
                  label="hvakosterstrommen.no"
                  icon="link"
                  color="secondary"
                  href="https://www.hvakosterstrommen.no/"
                  target="_blank"
                  no-caps
                  flat
                  class="q-mt-sm"
                />
                <p class="text-caption q-mt-sm">
                  Offisiell API for norske strømpriser
                </p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </main>
  </q-page>
  <footer class="text-center">
    <FooterSection />
  </footer>
</template>


<script setup lang="ts">
import FooterSection from 'src/components/FooterSection.vue';
import NavSection from 'src/components/NavSection.vue';

</script>
