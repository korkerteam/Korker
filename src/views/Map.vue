<script setup>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)

onMounted(() => {
  const map = L.map(mapContainer.value, {
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
})
</script>

<template>
  <div ref="mapContainer" class="ramka"></div>
</template>

<style scoped>
.ramka {
  width: 400px;
  height: 300px;
  border-style: solid;
  border-width: 4px;
  overflow: hidden;
}
</style>
