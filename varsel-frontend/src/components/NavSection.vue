<template>
  <nav class="q-py-md q-mb-lg">
    <div class="nav-container flex items-center justify-between">
      <router-link to="/" class="logo-link flex items-center">
        <span class="logo-text">VarsEL</span>
      </router-link>

      <ul class="nav-menu flex items-center">
        <li>
          <router-link to="/" class="nav-link">
            <q-icon name="schedule" class="nav-icon" />
            <span>I dag</span>
          </router-link>
        </li>
        <li>
          <router-link to="/history" class="nav-link">
            <q-icon name="history" class="nav-icon" />
            <span>Historikk</span>
          </router-link>
        </li>
        <li>
          <router-link to="/notifications" class="nav-link">
            <q-icon name="notifications" class="nav-icon" />
            <span>Varsler</span>
          </router-link>
        </li>
        <li>
          <router-link to="/about" class="nav-link">
            <q-icon name="info" class="nav-icon" />
            <span>Om</span>
          </router-link>
        </li>
        <li>
          <router-link to="/settings" class="nav-link">
            <q-icon name="settings" class="nav-icon" />
            <span>Innstillinger</span>
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss" scoped>

.nav-container {
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
}

.body--dark .nav-container {
  background: $dark-container;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

.logo-link {
  text-decoration: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
  }
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #000;
}

.body--dark .logo-text {
  color: white;
}

.nav-menu {
  list-style: none;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: inherit;
  position: relative;

  .nav-icon {
    font-size: 1.25rem;
    opacity: 0.8;
  }

  &:hover {
    background: rgba(0, 217, 192, 0.1);

    .nav-icon {
      opacity: 1;
    }
  }

  &.router-link-active {
    background-color: $primary;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 217, 192, 0.3);

    .nav-icon {
      opacity: 1;
    }
  }
}

// Mobile Responsive
@media (max-width: 868px) {
  .nav-menu {
    gap: 0.25rem;
    padding-block: 0;
    padding-inline: 1rem;
  }
  .nav-container {
    justify-content: center;
    padding: 0;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;


    .nav-icon {
      font-size: 1.25rem;
    }
  }

  .logo-text {
    display: none;
  }
}
</style>
