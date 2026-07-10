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
</script>

<template>
  <div class="map-wrapper">
    <div class="map-relative-box">
      <Transition name="fade" @after-enter="initLeaflet" @after-leave="destroyLeaflet">
        <div v-if="isMapVisible" ref="mapContainer" class="ramka"></div>
      </Transition>
    </div>

    <div class="button-container">
      <button v-if="!isMapVisible" @click="showMap" class="btn btn-show">Show map</button>
      <button v-else @click="hideMap" class="btn btn-hide">Hide map</button>
    </div>
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

.button-container {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn-show {
  background-color: #42b883;
}

.btn-show:hover {
  background-color: #35495e;
}

.btn-hide {
  background-color: #e056fd;
}

.btn-hide:hover {
  background-color: #be2edd;
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

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
