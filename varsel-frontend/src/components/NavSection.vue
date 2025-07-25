<template>
  <nav>
    <ul class="flex row items-center justify-center text-h6">
      <li><router-link to="/">Hjem</router-link></li>
      <li><router-link to="/notifications">Notifikasjoner</router-link></li>
      <li><router-link to="/about">Om</router-link></li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>

nav {
  padding: 10px;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1rem;


    li {
      a {
        padding: 0.5rem 1rem;
        text-decoration: none;
        color: $primary;
        font-weight: bold;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;

        &:hover {
          background-color: $primary;
          color: white;
        }
      }

    }
  }
}

</style>
