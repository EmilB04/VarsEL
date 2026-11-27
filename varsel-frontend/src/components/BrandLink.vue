<template>
  <router-link to="/" class="brand-link">
    <img src="/icons/varsel-192.png" alt="" width="34" height="34" />
    <span>VarsEL</span>
  </router-link>
</template>

<style scoped>
.brand-link {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  color: inherit;
  font-size: 1.22rem;
  font-weight: 800;
  letter-spacing: -0.045em;
  text-decoration: none;
}
.brand-link img {
  flex: 0 0 auto;
  border-radius: 10px;
}
.brand-link:hover {
  color: var(--q-primary);
}
</style>
