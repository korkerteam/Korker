import { supabase } from '@/lib/supabase.js'

const LOCAL_RATING_STORAGE_KEY = 'korker-local-ratings'

function normalizeToFive(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(5, n))
}

function readLocal() {
  if (typeof window === 'undefined') return new Map()
  try {
    const raw = window.localStorage.getItem(LOCAL_RATING_STORAGE_KEY)
    if (!raw) return new Map()
    const parsed = JSON.parse(raw)
    return new Map(Object.entries(parsed))
  } catch {
    return new Map()
  }
}

function writeLocal(map) {
  if (typeof window === 'undefined') return
  try {
    const obj = Object.fromEntries(map)
    window.localStorage.setItem(LOCAL_RATING_STORAGE_KEY, JSON.stringify(obj))
  } catch {
    // ignore storage errors
  }
}

async function getCurrentUserId() {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.id || null
  } catch {
    return null
  }
}

function getOrCreateLocalClientId() {
  if (typeof window === 'undefined') return 'local-anon'
  try {
    const key = 'korker-local-client-id'
    let id = window.localStorage.getItem(key)
    if (!id) {
      id = `local-${Math.random().toString(36).slice(2, 9)}`
      window.localStorage.setItem(key, id)
    }
    return id
  } catch {
    return `local-${Math.random().toString(36).slice(2, 9)}`
  }
}

export async function getAverageRating(tutorAuthId) {
  const map = readLocal()
  const entries = []
  for (const [key, raw] of map.entries()) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (parsed && parsed.tutor_auth_id === tutorAuthId) entries.push(parsed)
    } catch {
      // ignore malformed
    }
  }

  if (entries.length) {
    const sum = entries.reduce((acc, e) => acc + normalizeToFive(e.rating), 0)
    return { average: sum / entries.length, count: entries.length }
  }

  return { average: 0, count: 0 }
}

export async function getMyRatingForTutor(tutorAuthId) {
  const userId = (await getCurrentUserId()) || getOrCreateLocalClientId()
  if (!userId) return null
  const map = readLocal()
  const key = `${tutorAuthId}:${userId}`
  const raw = map.get(key)
  if (!raw) return null
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return normalizeToFive(parsed.rating)
  } catch {
    return null
  }
}

export async function submitRating(tutorAuthId, rating) {
  const userId = (await getCurrentUserId()) || getOrCreateLocalClientId()
  if (!userId) throw new Error('No user id available')
  const normalized = normalizeToFive(rating)
  const map = readLocal()
  const key = `${tutorAuthId}:${userId}`
  const payload = { tutor_auth_id: tutorAuthId, rater_auth_id: userId, rating: normalized }
  map.set(key, JSON.stringify(payload))
  writeLocal(map)
  try {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('korker-rating-changed', { detail: { tutorAuthId } }))
    }
  } catch {
    // ignore
  }
  return normalized
}
