<template>
  <div class="q-mt-xl">
    <h3 class="text-h6 q-mb-lg">Prissammendrag</h3>
    <div class="row q-gutter-md">
      <!-- Lowest Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card class="price-card glass-card lowest-price">
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="arrow_downward" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getMinPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">kr/kWh</div>
            <div class="price-label q-mb-sm">Laveste pris</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="schedule" size="xs" />
              {{ getMinPriceTime(prices) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Highest Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card class="price-card glass-card highest-price">
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="arrow_upward" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getMaxPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">kr/kWh</div>
            <div class="price-label q-mb-sm">Høyeste pris</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="schedule" size="xs" />
              {{ getMaxPriceTime(prices) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Current Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card class="price-card glass-card current-price">
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="schedule" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getCurrentPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">kr/kWh</div>
            <div class="price-label q-mb-sm">Nåværende pris</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="access_time" size="xs" />
              Nå {{ new Date().getHours() }}:00
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Average Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card class="price-card glass-card average-price">
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="insights" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getAvgPrice(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">kr/kWh</div>
            <div class="price-label q-mb-sm">Gjennomsnitt</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="hourglass_empty" size="xs" />
              {{ prices.length }} timer
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Difference Price Card -->
      <div class="col-12 col-sm-6 col-md">
        <q-card class="price-card glass-card difference-price">
          <q-card-section>
            <div class="card-icon q-mb-lg">
              <q-icon name="trending_flat" size="lg" />
            </div>
            <div class="price-value q-mb-xs">{{ getPriceDifference(prices).toFixed(2) }}</div>
            <div class="price-unit q-mb-sm">kr/kWh</div>
            <div class="price-label q-mb-sm">Forskjell</div>
            <div class="price-time q-gutter-xs">
              <q-icon name="compare_arrows" size="xs" />
              Høy - Lav
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTableServices, type Price } from 'src/scripts/TableScript'

interface Props {
  prices: Price[]
}

const props = defineProps<Props>()

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
}

.lowest-price {
  .card-icon {
    background: $positive;
    color: white;
  }
  .price-value {
    color: $positive;
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
}

.current-price {
  .card-icon {
    background: $info;
    color: white;
  }
  .price-value {
    color: $info;
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
}

.difference-price {
  .card-icon {
    background: $accent;
    color: white;
  }
  .price-value {
    color: $accent;
  }
}

.body--dark {
  .price-value {
    filter: brightness(1.3);
  }
}
</style>
