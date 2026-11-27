<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import norwegian from 'quasar/lang/nb-NO'
import english from 'quasar/lang/en-US'
import { useTheme, initTheme } from 'src/composables/useTheme'
import { useAccent } from 'src/composables/useAccent'
import { startAlertEngine } from 'src/composables/useAlertEngine'
import { LANGUAGE_KEY } from 'boot/i18n'
import { startOsloClock } from 'src/scripts/useOsloClock'

// Both composables are module-level singletons - importing/calling them here
// registers their reactive state/watchers as early as possible on load.
useTheme()
useAccent()
startOsloClock()

const { locale } = useI18n()
const quasar = useQuasar()
watch(locale, (value) => {
  quasar.lang.set(value === 'no-NO' ? norwegian : english)
  localStorage.setItem(LANGUAGE_KEY, value)
}, { immediate: true })

onMounted(() => {
  // Apply the stored/system theme now that Quasar is guaranteed to be fully
  // installed - doing this at module-eval time (before app.use(Quasar, ...))
  // gets silently overwritten once Quasar's own install touches body classes.
  initTheme()

  // Evaluate saved price alerts for as long as the app is open.
  startAlertEngine();
})
</script>
