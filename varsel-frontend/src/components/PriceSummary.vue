<template>
  <div class="q-mt-xl">
    <h3 class="text-h6 q-mb-lg">{{ t('priceSummary.heading') }}</h3>
    <div class="row q-gutter-md">
      <!-- Lowest Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card
          class="price-card glass-card lowest-price"
          :class="{ 'price-card--selected': selectedKey === 'lowest' }"
          clickable
          tabindex="0"
          role="button"
          :aria-pressed="selectedKey === 'lowest'"
          @click="toggle('lowest')"
          @keydown.enter="toggle('lowest')"
          @keydown.space.prevent="toggle('lowest')"
        >
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="arrow_downward" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getMinPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">{{ t('common.priceUnit') }}</div>
            <div class="price-label q-mb-sm">{{ t('priceSummary.lowest') }}</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="schedule" size="xs" />
              {{ getMinPriceTime(prices) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Highest Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card
          class="price-card glass-card highest-price"
          :class="{ 'price-card--selected': selectedKey === 'highest' }"
          clickable
          tabindex="0"
          role="button"
          :aria-pressed="selectedKey === 'highest'"
          @click="toggle('highest')"
          @keydown.enter="toggle('highest')"
          @keydown.space.prevent="toggle('highest')"
        >
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="arrow_upward" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getMaxPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">{{ t('common.priceUnit') }}</div>
            <div class="price-label q-mb-sm">{{ t('priceSummary.highest') }}</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="schedule" size="xs" />
              {{ getMaxPriceTime(prices) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Current Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card
          class="price-card glass-card current-price"
          :class="{ 'price-card--selected': selectedKey === 'current' }"
          clickable
          tabindex="0"
          role="button"
          :aria-pressed="selectedKey === 'current'"
          @click="toggle('current')"
          @keydown.enter="toggle('current')"
          @keydown.space.prevent="toggle('current')"
        >
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="schedule" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getCurrentPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">{{ t('common.priceUnit') }}</div>
            <div class="price-label q-mb-sm">{{ t('priceSummary.current') }}</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="access_time" size="xs" />
              {{ t('priceSummary.now', { hour: new Date().getHours() }) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Average Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card
          class="price-card glass-card average-price"
          :class="{ 'price-card--selected': selectedKey === 'average' }"
          clickable
          tabindex="0"
          role="button"
          :aria-pressed="selectedKey === 'average'"
          @click="toggle('average')"
          @keydown.enter="toggle('average')"
          @keydown.space.prevent="toggle('average')"
        >
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="insights" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getAvgPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">{{ t('common.priceUnit') }}</div>
            <div class="price-label q-mb-sm">{{ t('priceSummary.average') }}</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="hourglass_empty" size="xs" />
              {{ t('priceSummary.hours', { count: prices.length }) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Difference Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card
          class="price-card glass-card difference-price"
          :class="{ 'price-card--selected': selectedKey === 'difference' }"
          clickable
          tabindex="0"
          role="button"
          :aria-pressed="selectedKey === 'difference'"
          @click="toggle('difference')"
          @keydown.enter="toggle('difference')"
          @keydown.space.prevent="toggle('difference')"
        >
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="trending_flat" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getPriceDifference(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">{{ t('common.priceUnit') }}</div>
            <div class="price-label q-mb-sm">{{ t('priceSummary.difference') }}</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="compare_arrows" size="xs" />
              {{ t('priceSummary.highLow') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTableServices, type Price } from 'src/scripts/TableScript'
import type { HighlightKey } from 'src/scripts/ChartScript'

interface Props {
  prices: Price[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ highlight: [key: HighlightKey | null] }>()
const { t } = useI18n()

const selectedKey = ref<HighlightKey | null>(null)

function toggle(key: HighlightKey) {
  selectedKey.value = selectedKey.value === key ? null : key
  emit('highlight', selectedKey.value)
}

// Determine selected area from prices or default
const selectedArea = computed(() => {
  return props.prices[0]?.area || 'NO1'
})

const {
  getMinPrice,
  getMaxPrice,
  getAvgPrice,
  getPriceDifference,
  getMinPriceTime,
  getMaxPriceTime,
} = useTableServices(selectedArea)

function getCurrentPrice(prices: Price[]): number {
  if (!prices.length) return 0

  const now = new Date()
  const currentHour = now.getHours()
  const currentTime = `${currentHour.toString().padStart(2, '0')}:00`

  const currentPriceEntry = prices.find((price) => {
    if (!price.time_start) return false
    const priceHour = price.time_start.slice(11, 16)
    return priceHour === currentTime
  })

  return currentPriceEntry ? currentPriceEntry.NOK_per_kWh : 0
}
</script>

<style lang="scss" scoped>
.price-card {
  text-align: center;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease;

  &:focus-visible {
    outline: 2px solid var(--q-primary);
    outline-offset: 2px;
  }

  .card-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    margin-inline: auto;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
  }

  .price-value {
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1;
  }

  .price-unit {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .price-label {
    font-size: 1rem;
    font-weight: 600;
  }

  .price-time {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    opacity: 0.7;
  }

  &.price-card--selected {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  }
}

.lowest-price {
  .card-icon {
    background: $positive;
    color: white;
  }
  .price-value {
    color: $positive;
  }
  &.price-card--selected {
    border-color: $positive;
  }
}

.highest-price {
  .card-icon {
    background: $negative;
    color: white;
  }
  .price-value {
    color: $negative;
  }
  &.price-card--selected {
    border-color: $negative;
  }
}

.current-price {
  .card-icon {
    background: $info;
    color: white;
  }
  .price-value {
    color: $info;
  }
  &.price-card--selected {
    border-color: $info;
  }
}

.average-price {
  .card-icon {
    background: $warning;
    color: white;
  }
  .price-value {
    color: $warning;
  }
  &.price-card--selected {
    border-color: $warning;
  }
}

.difference-price {
  .card-icon {
    background: $accent;
    color: white;
  }
  .price-value {
    color: $accent;
  }
  &.price-card--selected {
    border-color: $accent;
  }
}

.body--dark {
  .price-value {
    filter: brightness(1.3);
  }
}
</style>
