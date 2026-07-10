<script setup>
import { ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)
const isMapVisible = ref(false)
let map = null

const showMap = () => {
  isMapVisible.value = true
}

const hideMap = () => {
  isMapVisible.value = false
}

// THIS METHOD DESTROYS THE MAP PROPERLY
const destroyLeaflet = () => {
  if (map) {
    map.remove() // LEAFLET METHOD TO REMOVE EVERYTHING FROM MEMORY
    map = null // SET THE REFERENCE TO NULL
  }
}

const initLeaflet = () => {
  // WE ALWAYS NEED TO RECREATE THE MAP HERE
  // BECAUSE VUE DESTROYS THE ORIGINAL HTML ELEMENT
  if (!map && mapContainer.value) {
    map = L.map(mapContainer.value, {
      attributionControl: false,
    }).setView([52.2297, 21.0122], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

    L.control
      .attribution({
        prefix: '<a href="https://leafletjs.com/">Leaflet</a>',
      })
      .addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      )
      .addTo(map)
  }
}

const toggleMap = () => {
  isMapVisible.value = !isMapVisible.value
}
</script>

<template>
  <div class="map-wrapper">
    <div class="map-relative-box">
      <Transition name="fade" @after-enter="initLeaflet" @after-leave="destroyLeaflet">
        <div v-if="isMapVisible" ref="mapContainer" class="ramka"></div>
      </Transition>
    </div>

    <button
      class="map-fab"
      @click="toggleMap"
      :title="isMapVisible ? 'Hide map' : 'Show map'"
      :aria-label="isMapVisible ? 'Hide map' : 'Show map'"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2 4 5v15l8 3 8-3V5l-8-3Zm0 2.18 6 2.25v11.14l-6 2.25-6-2.25V6.43l6-2.25Zm0 3.12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
          fill="currentColor"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.map-relative-box {
  position: relative;
  width: 408px;
  height: 208px;
}

.map-fab {
  position: fixed;
  bottom: 24px;
  right: 96px;
  z-index: 1200;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(79, 117, 199, 0.35);
  transition:
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.25s ease;
}

.map-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px rgba(79, 117, 199, 0.5);
}

.map-fab:active {
  transform: scale(0.92);
}

.map-fab svg {
  width: 22px;
  height: 22px;
}

.ramka {
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 200px;
  border-style: solid;
  border-width: 4px;
  overflow: hidden;
}
</style>
