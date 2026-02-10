<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Dark } from 'quasar'

// Initialize theme on app load
onMounted(() => {
  // Check for old 'colorMode' key and migrate to 'theme'
  const oldColorMode = localStorage.getItem('colorMode')
  if (oldColorMode) {
    localStorage.setItem('theme', oldColorMode)
    localStorage.removeItem('colorMode')
  }

  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark') {
    Dark.set(true)
  } else if (storedTheme === 'light') {
    Dark.set(false)
  } else {
    // If no preference, check system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    Dark.set(prefersDark)
    localStorage.setItem('theme', prefersDark ? 'dark' : 'light')
  }
})
</script>
