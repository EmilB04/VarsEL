<template>
  <div class="switch-container" :class="{ 'switch-active': isDark }">
    <div class="switch-content">
      <div class="switch-options">
        <div
          class="switch-option"
          :class="{ 'active': !isDark }"
          @click="setLight"
        >
          <q-icon name="light_mode" size="md" />
          <span class="option-label">Lys modus</span>
        </div>

        <div
          class="switch-option"
          :class="{ 'active': isDark }"
          @click="setDark"
        >
          <q-icon name="dark_mode" size="md" />
          <span class="option-label">Mørk modus</span>
        </div>
      </div>
    </div>

    <p class="switch-description">
      {{ isDark ? 'Skån øynene i mørket' : 'Lyser opp dagen' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Dark, useQuasar } from 'quasar'

const $q = useQuasar()
const isDark = ref(false)

// Initialize from localStorage and Quasar's current state
onMounted(() => {
  // Sync with Quasar's current dark mode state
  isDark.value = $q.dark.isActive

  // Also check localStorage to ensure consistency
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark') {
    isDark.value = true
    Dark.set(true)
  } else if (storedTheme === 'light') {
    isDark.value = false
    Dark.set(false)
  }
})

// Watch for external changes to dark mode (e.g., from App.vue initialization)
watch(() => $q.dark.isActive, (newValue) => {
  isDark.value = newValue
})

function toggleDark() {
  Dark.set(isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function setDark() {
  isDark.value = true
  toggleDark()
}

function setLight() {
  isDark.value = false
  toggleDark()
}
</script>

<style lang="scss" scoped>
.switch-container {
  width: 100%;
}

.switch-content {
  display: flex;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.body--dark .switch-content {
  background: rgba(255, 255, 255, 0.05);
}

.switch-options {
  display: flex;
  width: 100%;
  gap: 0.5rem;
}

.switch-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .q-icon {
    transition: all 0.3s ease;
    opacity: 0.5;
  }

  .option-label {
    font-size: 0.875rem;
    font-weight: 600;
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  &:hover {
    .q-icon,
    .option-label {
      opacity: 0.7;
    }
  }

  &.active {
    background: #00D9C0;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 217, 192, 0.3);

    .q-icon,
    .option-label {
      opacity: 1;
      color: white;
    }
  }
}

.switch-description {
  text-align: center;
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.body--dark .switch-description {
  color: #aaa;
}
</style>
