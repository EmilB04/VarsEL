<template>
  <q-btn
    v-if="available"
    flat
    no-caps
    icon="sym_o_install_mobile"
    class="install-button"
    :label="t('install.action')"
    @click="install"
  />
  <q-dialog v-model="showInstructions" aria-labelledby="install-title">
    <q-card class="install-dialog">
      <q-card-section>
        <h2 id="install-title" class="text-h6 q-mb-sm">{{ t('install.title') }}</h2>
        <p v-if="isIOS">{{ t('install.ios') }}</p>
        <p v-else>{{ t('install.android') }}</p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat no-caps :label="t('common.close')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

interface InstallEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const { t } = useI18n();
const displayMode = window.matchMedia('(display-mode: standalone)');
const isIOS =
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(navigator.userAgent);
const iosNavigator = navigator as Navigator & { standalone?: boolean };
const standalone = ref(displayMode.matches || iosNavigator.standalone === true);
const deferredPrompt = shallowRef<InstallEvent>();
const showInstructions = ref(false);
const available = computed(
  () =>
    window.isSecureContext &&
    !standalone.value &&
    (Boolean(deferredPrompt.value) || isIOS || isAndroid),
);

function deferPrompt(event: Event) {
  event.preventDefault();
  deferredPrompt.value = event as InstallEvent;
}

function markInstalled() {
  standalone.value = true;
  deferredPrompt.value = undefined;
}

function updateMode(event: MediaQueryListEvent) {
  standalone.value = event.matches || iosNavigator.standalone === true;
}

async function install() {
  if (!deferredPrompt.value) {
    showInstructions.value = true;
    return;
  }

  const prompt = deferredPrompt.value;
  deferredPrompt.value = undefined;
  try {
    const { outcome } = await prompt.prompt();
    if (outcome === 'accepted') markInstalled();
  } catch {
    showInstructions.value = isIOS || isAndroid;
  }
}

window.addEventListener('beforeinstallprompt', deferPrompt);
window.addEventListener('appinstalled', markInstalled);
displayMode.addEventListener('change', updateMode);
onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', deferPrompt);
  window.removeEventListener('appinstalled', markInstalled);
  displayMode.removeEventListener('change', updateMode);
});
</script>

<style scoped>
.install-button {
  min-height: 44px;
  padding-inline: 8px;
}
.install-dialog {
  width: min(100%, 430px);
}
.install-dialog h2 {
  margin-top: 0;
}
.install-dialog p {
  margin: 0;
  color: var(--text-subtle);
}
</style>
