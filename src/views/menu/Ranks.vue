<script setup>
import { ref } from 'vue'
import LoadingBox from '@/components/LoadingBox.vue'

const loading = ref(false)
</script>

<template>
  <LoadingBox v-if="loading" />
  <div v-else class="ranks-panel">
    <div class="ranks-header">
      <h3>TOP 10 NAUCZYCIELI: SKARBIMIERZYCE</h3>
    </div>

    <div class="ranks-body">
      <ol class="ranks-list">
        <li>
          <span class="rank">1</span><span class="name">LENA MEISSER</span
          ><span class="subject">J. POLSKI</span>
        </li>
        <li>
          <span class="rank">2</span><span class="name">PATRYCJA CHUDZYSKA</span
          ><span class="subject">CHEMIA</span>
        </li>
        <li>
          <span class="rank">3</span><span class="name">OSKAR MALYSZKO</span
          ><span class="subject">NIEM</span>
        </li>
        <li>
          <span class="rank">4</span><span class="name">KRYSTIAN H. OMOS</span
          ><span class="subject">PLASTYKA</span>
        </li>
        <li>
          <span class="rank">5</span><span class="name">MARTYNA WOJTCZAK</span
          ><span class="subject">NIC</span>
        </li>
        <li>
          <span class="rank">6</span><span class="name">BLAZEJ KACZALA</span
          ><span class="subject">BIOLOGIA</span>
        </li>
        <li>
          <span class="rank">7</span><span class="name">WIOLETTA MICHALAK</span
          ><span class="subject">MATEMATYKA</span>
        </li>
        <li>
          <span class="rank">8</span><span class="name">ALEX JAKUBEK</span
          ><span class="subject">PEDAL</span>
        </li>
        <li>
          <span class="rank">9</span><span class="name">AMELIA GRUBA</span
          ><span class="subject">J. POLSKI</span>
        </li>
        <li>
          <span class="rank">10</span><span class="name">ADRIAN GROCHOWSKI</span
          ><span class="subject">BIOLOGIA</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.ranks-panel {
  border: 1.5px solid var(--primary-color);
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.06);
  overflow: hidden;
  font-family: sans-serif;
  min-height: 0;
  max-height: calc(74vh - 50px);
  display: flex;
  flex-direction: column;
}

.ranks-header {
  padding: 18px 20px;
  background: linear-gradient(90deg, rgba(79, 117, 199, 0.06), rgba(79, 117, 199, 0.03));
  border-bottom: 1px solid rgba(79, 117, 199, 0.08);
}

.ranks-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 18px;
  font-weight: 700;
}

.ranks-body {
  padding: 16px 20px 22px 20px;
  overflow-y: auto;
}

/* Scrollbar styling for ranks body */
.ranks-body::-webkit-scrollbar {
  width: 10px;
}
.ranks-body::-webkit-scrollbar-track {
  background: transparent;
}
.ranks-body::-webkit-scrollbar-thumb {
  background: rgba(79, 117, 199, 0.22);
  border-radius: 8px;
}
.ranks-body:hover::-webkit-scrollbar-thumb {
  background: rgba(79, 117, 199, 0.32);
}
.ranks-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 117, 199, 0.22) transparent;
}

.ranks-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranks-list li {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.12s ease;
}

.ranks-list li:hover {
  background: rgba(79, 117, 199, 0.04);
}

.rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-weight: 700;
}

.name {
  font-weight: 700;
  color: #111827;
}

.subject {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}
</style>
