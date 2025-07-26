<template>
  <nav>
    <ul class="flex row items-center justify-between text-h6">
      <li><router-link to="/">VarsEL</router-link></li>
      <div class="flex row items-center">
        <li><router-link to="/">Strømpriser</router-link></li>
        <span class="nav-separator"></span>
        <li><router-link to="/notifications">Notifikasjoner</router-link></li>
      </div>
      <li><router-link to="/about">Om</router-link></li>
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
  }

    div {
      gap: 1rem;

      .nav-separator {
        width: 2px;
        height: 2rem;
        background-color: $primary;
        opacity: 0.6;
        display: inline-block;
      }
    }

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
</style>
