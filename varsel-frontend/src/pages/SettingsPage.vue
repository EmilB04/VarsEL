<template>
  <q-page class="modern-page q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <div class="hero-section q-mb-xl">
        <h1 class="text-h4 q-mt-md q-mb-md">Innstillinger</h1>
        <p class="text-subtitle1 text-grey-7">Tilpass applikasjonen etter dine preferanser</p>
      </div>

      <div class="settings-container">
        <div class="row q-gutter-lg justify-center">
          <q-card class="settings-card glass-card col-12 col-md-5">
            <q-card-section>
              <div class="settings-header">
                <q-icon name="palette" size="md" color="primary" />
                <h3 class="text-h6">Utseende</h3>
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">Velg mellom lys og mørk modus</p>
              <ColorMode />
            </q-card-section>
          </q-card>

          <q-card class="settings-card glass-card col-12 col-md-5">
            <q-card-section>
              <div class="settings-header">
                <q-icon name="receipt" size="md" color="secondary" />
                <h3 class="text-h6">Prisvisning</h3>
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">Inkluder eller ekskluder merverdiavgift</p>
              <TaxMode />
            </q-card-section>
          </q-card>
        </div>

        <q-banner class="info-banner glass-card q-mt-xl" rounded>
          <template v-slot:avatar>
            <q-icon name="info" color="info" size="lg" />
          </template>
          <div class="text-body1">
            <strong>Tips:</strong> Endringer lagres automatisk og påvirker alle visninger av strømpriser.
          </div>
        </q-banner>
      </div>
    </main>
  </q-page>
</template>

<style lang="scss" scoped>
.modern-page {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 2rem 0;
  position: relative;

  .text-h4 {
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .settings-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;

    h3 {
      margin: 0;
      font-weight: 600;
    }
  }
}

.info-banner {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 1rem 0;

    .text-h4 {
      font-size: 1.75rem;
    }
  }
}
</style>

<script setup lang="ts">
import ColorMode from 'src/components/ColorMode.vue'
import NavSection from 'src/components/NavSection.vue';
import TaxMode from 'src/components/TaxMode.vue'
</script>
