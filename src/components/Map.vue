<script setup>
import { ref, computed, inject, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)
const isMapVisible = ref(false)
let map = null

const { showChatGlobal: showChat } = inject('globalChat', {
  showChatGlobal: ref(false),
})
const isChatOpen = computed(() => showChat.value)

watch(isChatOpen, (isOpen) => {
  if (isOpen) {
    isMapVisible.value = false
    destroyLeaflet()
  }
})

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
  if (isChatOpen.value) return
  isMapVisible.value = !isMapVisible.value
}
</script>

<template>
  <div v-if="!isChatOpen" class="map-wrapper">
    <div class="map-relative-box">
      <Transition name="fade" @after-enter="initLeaflet" @after-leave="destroyLeaflet">
        <div v-if="isMapVisible" ref="mapContainer" class="ramka"></div>
      </Transition>
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

.map-fab {
  position: fixed;
  bottom: 24px;
  right: 96px;
  z-index: 1300;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-hover) 100%);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 1px rgba(91, 120, 198, 0.2),
    0 10px 28px rgba(91, 120, 198, 0.24);
  transition:
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.25s ease;
}

.map-fab:hover {
  transform: scale(1.08);
  box-shadow:
    0 0 0 1px rgba(91, 120, 198, 0.24),
    0 14px 34px rgba(91, 120, 198, 0.32);
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
  border-color: var(--accent-strong);
  border-radius: 18px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(91, 120, 198, 0.16),
    0 0 24px rgba(91, 120, 198, 0.2);
}
</style>
