<template>
  <nav>
    <ul class="flex row items-center justify-between text-h6">
      <li><router-link to="/"><img :src="Logo" alt="VarsEL" /></router-link></li>
      <div class="flex row">
        <li><router-link to="/">I dag</router-link></li>
        <li><router-link to="/history">Historikk</router-link></li>
        <li><router-link to="/notifications">Varsler</router-link></li>
        <li><router-link to="/about">Om</router-link></li>
        <li><router-link to="/settings">Innstillinger</router-link></li>
      </div>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  padding: 10px;

  ul {
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1);
    list-style: none;
    margin: 0;
    padding: 1rem;
    gap: 1rem;
    transition: background-color 0.3s ease-in-out;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;

    div {
      gap: 0.5rem;

      li {
        a {
          padding: 0.5rem 1rem;
          text-decoration: none;
          color: $primary;
          font-weight: bold;
          border-radius: 8px;
          transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;

          &:hover {
            background-color: $primary;
            border-radius: 8px;
            color: white;
          }

        }
      }
    }
    img {
      max-width: 100%;
      aspect-ratio: 1/1;
      border-radius: 50%;
      height: 5rem;
      width: auto;
      transition: none;
    }
  }
}
</style>
<script scoped setup lang="ts">
import Logo from '../assets/gpt_logo.png'
</script>
