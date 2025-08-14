<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
    </header>
    <main>
      <div class="q-mb-md">
        <q-btn flat icon="arrow_back" label="Tilbake" @click="$router.go(-1)" />
      </div>
      <h1 class="text-h6 text-center">Innstillinger</h1>
      <div class="flex row justify-center">
        <ColorMode />
        <TaxMode />
      </div>
    </main>
  </q-page>
</template>


<script scoped setup lang="ts">
import ColorMode from 'src/components/ColorMode.vue'
import NavSection from 'src/components/NavSection.vue';
import TaxMode from 'src/components/TaxMode.vue'
</script>
