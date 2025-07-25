<template>
  <div class="flex column items-center justify-center">
    <h1 class="text-h3 text-center">VarsEL - Hent strømpriser for ditt område</h1>
    <div class="flex row q-mt-md">
      <ColorMode />
      <TaxMode />
    </div>
  </div>
</template>


<script setup lang="ts">
import ColorMode from 'src/components/ColorMode.vue'
import TaxMode from './TaxMode.vue';
</script>
