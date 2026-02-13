<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <HeroSection
        title="Innstillinger"
        description="Tilpass applikasjonen etter dine preferanser"
      />

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
      </div>
    </main>
  </q-page>
</template>

<style lang="scss" scoped>

:deep(.hero-section) {
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
  :deep(.hero-section) {
    padding: 1rem 0;

    .text-h4 {
      font-size: 1.75rem;
    }
  }
}
</style>

<script setup lang="ts">
import ColorMode from 'src/components/ColorMode.vue'
import HeroSection from 'src/components/HeroSection.vue'
import NavSection from 'src/components/NavSection.vue';
import TaxMode from 'src/components/TaxMode.vue'
</script>
