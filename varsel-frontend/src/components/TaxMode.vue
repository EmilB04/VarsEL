<template>
  <div>
    <q-toggle
      v-model="isTaxIncluded"
      color="primary"
      checked-icon="check"
      unchecked-icon="close"
      @update:model-value="toggleTax"
      :label="isTaxIncluded ? 'MVA inkludert' : 'MVA ekskludert'"
    >
      <q-popup-proxy transition-show="scale" transition-hide="scale" self="top middle">
        <q-banner class="bg-orange text-white text-center" style="min-width: 250px;">
          <template v-slot:avatar>
            <q-icon name="refresh" color="white" />
          </template>
          Du må oppdatere siden for å se endringene i MVA-innstillingene.
        </q-banner>
      </q-popup-proxy>
    </q-toggle>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const isTaxIncluded = ref(true);

function toggleTax() {
  localStorage.setItem('isTaxIncluded', isTaxIncluded.value.toString());
}
onMounted(() => {
  const storedTax = localStorage.getItem('isTaxIncluded');
  isTaxIncluded.value = storedTax === 'true';
  toggleTax();
});
</script>

<style scoped lang="scss"></style>
