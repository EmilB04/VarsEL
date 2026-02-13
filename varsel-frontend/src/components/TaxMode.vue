<template>
  <div class="switch-container" :class="{ 'switch-active': isTaxIncluded }">
    <div class="switch-content">
      <div class="switch-options">
        <div
          class="switch-option"
          :class="{ 'active': !isTaxIncluded }"
          @click="setExcluded"
        >
          <q-icon name="money_off" size="md" />
          <span class="option-label">Uten MVA</span>
        </div>

        <div
          class="switch-option"
          :class="{ 'active': isTaxIncluded }"
          @click="setIncluded"
        >
          <q-icon name="receipt_long" size="md" />
          <span class="option-label">Med MVA</span>
        </div>
      </div>
    </div>

    <p class="switch-description">
      {{ isTaxIncluded ? 'Priser inkluderer 25% MVA' : 'Priser vises uten MVA' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const isTaxIncluded = ref(true);
const showRefreshNote = ref(false);

function toggleTax() {
  localStorage.setItem('isTaxIncluded', isTaxIncluded.value.toString());
  showRefreshNote.value = true;

  // Hide the note after 5 seconds
  setTimeout(() => {
    showRefreshNote.value = false;
  }, 5000);
}

function setIncluded() {
  isTaxIncluded.value = true;
  toggleTax();
}

function setExcluded() {
  isTaxIncluded.value = false;
  toggleTax();
}

onMounted(() => {
  const storedTax = localStorage.getItem('isTaxIncluded');
  isTaxIncluded.value = storedTax === 'true';
});
</script>

<style scoped lang="scss">
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
    background: #6366F1;
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

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

.refresh-note {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);

  :deep(.q-banner__content) {
    padding: 0.5rem;
  }
}

.body--dark .refresh-note {
  background: rgba(245, 158, 11, 0.15);
}
</style>
