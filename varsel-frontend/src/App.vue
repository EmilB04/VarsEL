<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'
import { useTheme, initTheme } from 'src/composables/useTheme'
import { useAccent } from 'src/composables/useAccent'
import { LANGUAGE_KEY } from 'boot/i18n'

// Both composables are module-level singletons - importing/calling them here
// registers their reactive state/watchers as early as possible on load.
useTheme()
useAccent()

const { locale } = useI18n()
watch(locale, (value) => {
  localStorage.setItem(LANGUAGE_KEY, value)
})

onMounted(() => {
  // Apply the stored/system theme now that Quasar is guaranteed to be fully
  // installed - doing this at module-eval time (before app.use(Quasar, ...))
  // gets silently overwritten once Quasar's own install touches body classes.
  initTheme()

  // Fire-and-forget: wake up the backend as early as possible so a Render
  // cold start happens while the user is still looking at the page, not
  // after they've picked a region and are waiting on real data.
  void api.get('/health').catch(() => {
    // Ignored - the real price request will surface any lasting error.
  });
})
</script>
