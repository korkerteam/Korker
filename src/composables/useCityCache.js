import { ref } from 'vue'

const DB_NAME = 'korker-cache'
const STORE_NAME = 'cities'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getCached(key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(key)
    req.onsuccess = () => {
      resolve(req.result)
      db.close()
    }
    req.onerror = () => {
      reject(req.error)
      db.close()
    }
  })
}

async function setCache(key, data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(data, key)
    tx.oncomplete = () => {
      resolve()
      db.close()
    }
    tx.onerror = () => {
      reject(tx.error)
      db.close()
    }
  })
}

export function useCityCache() {
  const cities = ref([])
  const loading = ref(true)

  async function loadCities() {
    loading.value = true
    try {
      let data = await getCached('miasta_polskie')
      if (!data) {
        const res = await fetch('/miasta_polskie.json')
        data = await res.json()
        await setCache('miasta_polskie', data)
      }
      cities.value = data
    } catch (err) {
      console.error('Failed to load cities:', err)
    } finally {
      loading.value = false
    }
  }

  return { cities, loading, loadCities }
}
