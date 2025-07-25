<template>
  <q-page class="q-pa-md">
    <header>
      <NavSection />
      <h1 class="text-h3 text-center">Om VarsEL</h1>
    </header>
    <main>
      <article>
        <h2 class="text-h4">Hva er VarsEL:</h2>
        <p class="text-body1">
          VarsEL er en tjeneste som lar deg overvåke strømpriser i sanntid og motta varsler når prisene kommer på et
          ønsket nivå.
          Dette gjør det enklere for deg å planlegge strømforbruket ditt og spare penger.
        </p>
      </article>
      <article>
        <h2 class="text-h4">Hvordan fungerer det:</h2>
        <p class="text-body1">
          Tjenesten henter strømpriser fra <i>Hva koster strømmen</i>. Du kan velge et område og en by, og deretter
          hente priser for en spesifikk dato.
          Du kan også spesifisere et tidsintervall for når du ønsker å se prisene.
          Når du har hentet prisene, kan du se dem i en tabell.
          Du kan også sette opp varsler for når prisene faller under et bestemt nivå.
        </p>
      </article>
      <article>
        <h2 class="text-h4">Hvem står bak:</h2>
        <p class="text-body1">
          Tjenesten er utviklet av Emil Berglund og er åpen kildekode. Du kan finne kildekoden på
          <a href="https://github.com/EmilB04/VarsEL" target="_blank" class="text-primary">GitHub</a>.
        </p>
      </article>
    </main>
  </q-page>
  <footer class="text-center">
    <FooterSection />
  </footer>
</template>


<script setup lang="ts">
import FooterSection from 'src/components/FooterSection.vue';
import NavSection from 'src/components/NavSection.vue';

</script>
