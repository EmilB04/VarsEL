<template>
  <nav class="q-mb-lg top-nav">
    <div class="nav-container flex items-center">
      <ul class="nav-menu flex items-center">
        <li v-for="item in navItems" :key="item.to">
          <router-link :to="item.to" class="nav-link">
            <q-icon :name="item.icon" class="nav-icon" />
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>

      <SettingsMenu variant="nav" class="settings-slot" />
    </div>
  </nav>

  <nav class="bottom-nav" :aria-label="t('nav.today')">
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav-link"
    >
      <q-icon :name="item.icon" class="bottom-nav-icon" />
      <span class="bottom-nav-label">{{ item.label }}</span>
    </router-link>
    <SettingsMenu variant="bottom" />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SettingsMenu from './SettingsMenu.vue';

const { t } = useI18n();

const navItems = computed(() => [
  { to: '/', icon: 'schedule', label: t('nav.today') },
  { to: '/history', icon: 'history', label: t('nav.history') },
  { to: '/notifications', icon: 'notifications', label: t('nav.notifications') },
  { to: '/about', icon: 'info', label: t('nav.about') },
]);
</script>

<style lang="scss" scoped>

.nav-container {
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border);
  transition: border-color 0.3s ease;
}

.nav-menu {
  list-style: none;
  gap: 0.375rem;
}

.settings-slot {
  margin-left: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 9999px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: inherit;
  position: relative;

  .nav-icon {
    font-size: 1.25rem;
    opacity: 0.8;
  }

  &:hover {
    background: color-mix(in srgb, var(--q-primary) 10%, transparent);

    .nav-icon {
      opacity: 1;
    }
  }

  &.router-link-active {
    background-color: var(--q-primary);
    color: white;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--q-primary) 30%, transparent);

    .nav-icon {
      opacity: 1;
    }
  }
}

// Bottom tab bar - mobile only (see media query below for visibility)
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: none;
  align-items: stretch;
  justify-content: space-around;
  background: var(--surface-card);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.bottom-nav-link {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  min-height: 56px;
  padding: 0.375rem 0.25rem;
  text-decoration: none;
  color: inherit;
  opacity: 0.7;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .bottom-nav-icon {
    font-size: 1.35rem;
  }

  .bottom-nav-label {
    font-size: 0.7rem;
    font-weight: 600;
  }

  &.router-link-active {
    opacity: 1;
    color: var(--q-primary);
  }
}

// Mobile Responsive - the bottom tab bar takes over navigation + settings entirely,
// so the top bar (nothing left to show there) is hidden rather than left empty.
@media (max-width: 868px) {
  .top-nav {
    display: none;
  }

  .bottom-nav {
    display: flex;
  }
}
</style>
