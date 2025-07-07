<template>
  <div>
    <q-toggle
      v-model="isTaxIncluded"
      color="primary"
      checked-icon="check"
      unchecked-icon="close"
      @update:model-value="toggleTax"
      :label="isTaxIncluded ? 'MVA inkludert' : 'MVA ekskludert'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const isTaxIncluded = ref(true)

onMounted(() => {
  const storedTax = localStorage.getItem('isTaxIncluded')
  isTaxIncluded.value = storedTax === 'true'
})

function toggleTax() {
  localStorage.setItem('isTaxIncluded', isTaxIncluded.value.toString())
  console.log('isTaxIncluded:', isTaxIncluded.value)
}
onMounted(() => {
  toggleTax()
})

</script>
