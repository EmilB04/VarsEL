<template>
  <q-toggle
    v-model="isDark"
    checked-icon="dark_mode"
    unchecked-icon="light_mode"
    color="primary"
    @update:model-value="toggleDark"
    :label="isDark ? 'Mørk modus' : 'Lys modus'"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Dark } from 'quasar'

const isDark = ref(false)

onMounted(() => {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark') {
    isDark.value = true
    Dark.set(true)
  } else {
    isDark.value = false
    Dark.set(false)
  }
})

function toggleDark() {
  Dark.set(isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>
