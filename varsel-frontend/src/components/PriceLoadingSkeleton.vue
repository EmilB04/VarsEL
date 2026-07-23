<template>
  <div class="q-mt-lg" aria-hidden="true">
    <q-skeleton type="text" width="260px" height="28px" class="q-mb-lg" />

    <div class="skeleton-chart q-mb-xl">
      <q-skeleton height="100%" style="border-radius: 20px" />
    </div>

    <div class="row q-gutter-md">
      <div v-for="n in 5" :key="n" class="col-12 col-sm-6 col-md">
        <q-skeleton height="180px" style="border-radius: 20px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Shape-matched placeholder shown while backend requests are in flight, so
// the page doesn't jump/reflow once real data (chart + summary cards) arrives.
</script>

<style lang="scss" scoped>
.skeleton-chart {
  height: 450px;
  border-radius: 20px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .skeleton-chart {
    height: 300px;
  }
}
</style>
