<template>
  <div class="modern-footer">
    <div class="footer-content">
      <p class="copyright">
        <q-icon name="bolt" size="sm" class="q-mr-xs" />
        &copy; {{ new Date().getFullYear() }} VarsEL
      </p>
      <p class="creator">
        Designet og utviklet av <a href="https://github.com/EmilB04" target="_blank" rel="noopener noreferrer"><strong>Emil Berglund</strong></a>
      </p>
      <a
        href="https://www.hvakosterstrommen.no"
        target="_blank"
        rel="noopener noreferrer"
        class="data-source"
        title="Hva koster strømmen? Strømpriser levert av Hva koster strømmen.no"
      >
        <img
          src="https://i.bnfcl.io/hva-koster-strommen/strompriser-levert-av-hvakosterstrommen_oTtWvqeiB.png"
          alt="Strømpriser levert av Hva koster strømmen.no"
          width="180"
          height="40"
          class="source-logo"
        />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
// Modern footer component with cleaner design
</script>

<style lang="scss" scoped>
.modern-footer {
  padding: 2rem 1rem;
  margin-top: 4rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.body--dark .modern-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;

  .copyright {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: inherit;
  }

  .creator {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.8;

    strong {
      background: linear-gradient(135deg, #00D9C0, #6366F1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
    a {
      text-decoration: none;
    }
  }

  .data-source {
    text-decoration: none;
    transition: transform 0.2s ease, opacity 0.2s ease;
    opacity: 0.9;

    &:hover {
      transform: scale(1.05);
      opacity: 1;
    }

    .source-logo {
      display: block;
      max-width: 100%;
      height: auto;
    }
  }
}

@media (max-width: 768px) {
  .footer-content {
    gap: 1rem;

    .copyright,
    .creator {
      font-size: 0.8rem;
    }
  }
}
</style>
