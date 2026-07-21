<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  cities: Array,
  filterQuery: String,
})

const emit = defineEmits(['city-select'])

const mapContainer = ref(null)
let map = null
let markerLayer = null
let boundaryLayer = null
let resizeObserver = null

function initMap() {
  if (map || !mapContainer.value) return

  map = L.map(mapContainer.value, {
    attributionControl: false,
  }).setView([52.0, 19.5], 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  L.control
    .attribution({ prefix: '<a href="https://leafletjs.com/">Leaflet</a>' })
    .addAttribution(
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    )
    .addTo(map)

  markerLayer = L.layerGroup().addTo(map)
  boundaryLayer = L.layerGroup().addTo(map)

  map.on('click', clearSelection)
}

function getFilteredCities() {
  const query = (props.filterQuery || '').trim()
  if (query.length < 3) {
    return props.cities.filter((c) => c.Type === 'city')
  }
  const lower = query.toLowerCase()
  const all = props.cities.filter((c) => c.Name.toLowerCase().includes(lower))
  return all.slice(0, 200)
}

let selectedMarker = null

function resetMarkerStyle(marker) {
  if (!marker) return
  marker.setStyle({
    radius: 6,
    fillColor: '#4a7cff',
    color: '#fff',
    weight: 2,
    fillOpacity: 0.8,
  })
}

function clearSelection() {
  if (selectedMarker) {
    resetMarkerStyle(selectedMarker)
    selectedMarker = null
    boundaryLayer?.clearLayers()
  }
}

function addMarker(city) {
  const lat = parseFloat(city.Latitude)
  const lng = parseFloat(city.Longitude)
  if (isNaN(lat) || isNaN(lng)) return null

  const marker = L.circleMarker([lat, lng], {
    radius: 6,
    fillColor: '#4a7cff',
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8,
  }).addTo(markerLayer)

  marker.bindTooltip(city.Name, { direction: 'top' })
  marker.on('click', () => handleMarkerClick(city, marker))
  return marker
}

function updateMarkers() {
  if (!markerLayer || !map) return
  markerLayer.clearLayers()
  boundaryLayer.clearLayers()
  selectedMarker = null

  const filtered = getFilteredCities()
  if (filtered.length === 0) return

  const bounds = []
  for (const city of filtered) {
    const marker = addMarker(city)
    if (marker) {
      const latlng = marker.getLatLng()
      bounds.push([latlng.lat, latlng.lng])
    }
  }

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 })
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 10)
  }
}

async function handleMarkerClick(city, marker) {
  if (selectedMarker === marker) {
    clearSelection()
    return
  }

  clearSelection()
  boundaryLayer.clearLayers()

  marker.setStyle({
    radius: 9,
    fillColor: '#ff6b4a',
    color: '#fff',
    weight: 3,
    fillOpacity: 1,
  })
  selectedMarker = marker

  try {
    const params = new URLSearchParams({
      city: city.Name,
      state: city.Province,
      countrycodes: 'pl',
      format: 'jsonv2',
      polygon_geojson: 1,
      addressdetails: 0,
      extratags: 0,
      namedetails: 0,
      limit: 1,
    })
    const res = await fetch(`/nominatim/search?${params}`)
    const data = await res.json()

    if (data && data.length > 0 && data[0].geojson) {
      L.geoJSON(data[0].geojson, {
        style: { color: '#ff6b4a', weight: 3, fillOpacity: 0.12 },
      }).addTo(boundaryLayer)
    } else {
      console.warn('No boundary data from Nominatim for', city.Name, data)
    }
  } catch (err) {
    console.error('Failed to fetch city boundary for', city.Name, err)
  }

  emit('city-select', city)
}

watch(
  () => [props.cities, props.filterQuery],
  () => {
    if (map) updateMarkers()
  },
  { deep: true },
)

onMounted(() => {
  initMap()
  if (mapContainer.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize()
    })
    resizeObserver.observe(mapContainer.value)
  }
  setTimeout(() => {
    map?.invalidateSize()
    updateMarkers()
  }, 200)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div ref="mapContainer" class="city-map"></div>
</template>

<style scoped>
.city-map {
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
}
</style>
