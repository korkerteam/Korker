<script setup></script>

<template>
  <div class="ranking-container">
    <h2>TOP 10 NAUCZYCIELI: SKARBIMIERZYCE</h2>
    <div class="białe-tło">
      <ol>
        <li>LENA MEISSER, J. POLSKI</li>
        <li>PATRYCJA CHUDZYSKA, CHEMIA</li>
        <li>OSKAR MALYSZKO, NIEM</li>
        <li>KRYSTIAN H. OMOS, PLASTYKA</li>
        <li>MARTYNA WOJTCZAK, NIC</li>
        <li>BLAZEJ KACZALA, BIOLOGIA</li>
        <li>WIOLETTA MICHALAK, MATEMATYKA</li>
        <li>ALEX JAKUBEK, PEDAL</li>
        <li>AMELIA GRUBA, J. POLSKI</li>
        <li>ADRIAN GROCHOWSKI, BIOLOGIA</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.ranking-container {
  position: absolute;
  top: 200px;
  left: 900px;

  background-color: #4f75c7; /* Niebieski kolor z projektu */
  color: white;
  padding: 30px;
  border-radius: 20px;
  width: 500px; /* Szerokość okna z rankingiem */
  font-family: sans-serif;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); /* Delikatny cień */
}

.białe-tło {
  background-color: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
}
h2 {
  margin-top: 0;
  font-size: 20px;
  letter-spacing: 1px;
}

ol {
  /* Kluczowe reguły dla wyświetlania numerków */
  list-style-type: decimal; /* Wymusza standardowe cyfry 1, 2, 3... */
  margin: 0;
  padding-left: 20px; /* Przestrzeń na kropki i cyfry */
}

li {
  margin: 12px 0;
  font-weight: bold;
  font-size: 16px;
}
</style>
