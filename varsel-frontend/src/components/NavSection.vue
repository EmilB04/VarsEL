<template>
  <header class="app-header" :class="{ 'app-header--settled': settled }">
    <div class="nav-container">
      <BrandLink class="nav-island header-brand" />

      <div class="nav-cluster">
        <nav class="top-nav nav-island" :aria-label="t('nav.main')">
          <router-link
            v-for="item in primaryNavigation"
            :key="item.to"
            :to="item.to"
            class="nav-link"
          >
            {{ t(item.label) }}
          </router-link>
        </nav>

        <div class="header-actions">
          <InstallPrompt />
          <SettingsMenu class="nav-island settings-control" />
        </div>
      </div>
    </div>
  </header>

  <nav class="bottom-nav shell-glass" :aria-label="t('nav.main')">
    <router-link v-for="item in primaryNavigation" :key="item.to" :to="item.to" class="nav-link">
      <q-icon :name="item.icon" size="22px" aria-hidden="true" />
      <span>{{ t(item.label) }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BrandLink from './BrandLink.vue';
import SettingsMenu from './SettingsMenu.vue';
import InstallPrompt from './InstallPrompt.vue';

const { t } = useI18n();
const settled = ref(false);
const primaryNavigation = [
  { to: '/', icon: 'sym_o_bolt', label: 'nav.today' },
  { to: '/history', icon: 'sym_o_history', label: 'nav.history' },
  { to: '/notifications', icon: 'sym_o_notifications', label: 'nav.notifications' },
  { to: '/about', icon: 'sym_o_info', label: 'nav.about' },
] as const;

function updateScrollState() {
  settled.value = window.scrollY > 24;
}

onMounted(() => {
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
});

onBeforeUnmount(() => window.removeEventListener('scroll', updateScrollState));
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 2100;
  padding: calc(15px + env(safe-area-inset-top, 0px)) var(--page-gutter) 5px;
  padding-inline-start: max(var(--page-gutter), env(safe-area-inset-left));
  padding-inline-end: max(var(--page-gutter), env(safe-area-inset-right));
  pointer-events: none;
  --nav-fill: color-mix(in srgb, var(--surface-card) 46%, transparent);
}
.app-header--settled {
  --nav-fill: var(--glass-fill);
}
.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 52px;
  max-width: calc(var(--app-width) - 2 * var(--page-gutter));
  margin-inline: auto;
  transition: transform 220ms ease;
}
.app-header--settled .nav-container {
  transform: translateY(-5px);
}
.nav-cluster,
.top-nav,
.header-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}
.nav-island {
  color: var(--app-ink);
  border: 1px solid var(--glass-edge);
  border-radius: 999px;
  background: var(--surface-card);
  pointer-events: auto;
  transition:
    background-color 220ms ease,
    box-shadow 220ms ease;
}
.app-header--settled .nav-island {
  box-shadow: 0 5px 18px var(--glass-shadow);
}
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .nav-island {
    background: var(--nav-fill);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    backdrop-filter: blur(16px) saturate(140%);
  }
}
@media (prefers-reduced-transparency: reduce), (forced-colors: active) {
  .nav-island {
    background: var(--surface-card);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
.header-brand {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 5px 13px 5px 6px;
  font-size: 1rem;
}
.header-brand :deep(img) {
  width: 33px;
  height: 33px;
  border-radius: 50%;
}
.top-nav {
  gap: 2px;
  min-height: 46px;
  padding: 3px;
}
.settings-control :deep(.gear-trigger) {
  width: 44px;
  height: 44px;
}
.header-actions :deep(.install-button) {
  min-height: 44px;
  padding-inline: 13px;
  border-radius: 999px;
  background: var(--q-primary);
  color: var(--on-primary, #fff);
  white-space: nowrap;
  pointer-events: auto;
}
.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  padding: 3px 15px;
  border-radius: 999px;
  color: var(--text-subtle);
  font-weight: 650;
  text-decoration: none;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}
@media (hover: hover) {
  .nav-link:hover {
    color: var(--app-ink);
    background: var(--surface-inset);
  }
}
.nav-link.router-link-exact-active {
  color: var(--q-primary);
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 1px var(--accent-edge);
}
.bottom-nav {
  display: none;
}
@media (forced-colors: active) {
  .nav-link.router-link-exact-active {
    outline: 1px solid Highlight;
    outline-offset: -2px;
  }
}
@media (max-width: 868px) {
  .top-nav {
    display: none;
  }
  .bottom-nav {
    display: flex;
    position: fixed;
    inset-inline-start: max(var(--dock-gap), env(safe-area-inset-left));
    inset-inline-end: max(var(--dock-gap), env(safe-area-inset-right));
    bottom: calc(var(--dock-gap) + env(safe-area-inset-bottom, 0px));
    z-index: 2000;
    gap: 4px;
    max-width: 440px;
    min-height: var(--dock-height);
    margin-inline: auto;
    padding: 4px;
    border-radius: 999px;
  }
  .bottom-nav .nav-link {
    flex: 1 1 0;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
    min-height: 48px;
    padding-inline: 4px;
    font-size: 0.75rem;
    text-align: center;
  }
}
@media (max-width: 360px) {
  .header-actions {
    gap: 5px;
  }
  .header-actions :deep(.install-button) {
    padding-inline: 8px;
    font-size: 0.75rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .nav-container,
  .nav-island {
    transition: none;
  }
}
</style>
