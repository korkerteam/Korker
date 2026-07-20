import { supabase } from '@/lib/supabase.js'

const LOCAL_RATING_STORAGE_KEY = 'korker-local-ratings'
const RATING_TABLE = 'ratings'

function normalizeToFive(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(5, n))
}
async function getCurrentUserId() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user?.id) return session.user.id

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

function coerceEntry(raw) {
  if (!raw) return null
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!parsed || typeof parsed !== 'object') return null
    return {
      tutor_auth_id: parsed.tutor_auth_id,
      rater_auth_id: parsed.rater_auth_id,
      rating: normalizeToFive(parsed.rating),
    }
  } catch {
    return null
  }
}

async function loadRemoteEntries(tutorAuthId) {
  if (!tutorAuthId) return []
  try {
    const { data, error } = await supabase
      .from(RATING_TABLE)
      .select('tutor_auth_id, rater_auth_id, rating')
      .eq('tutor_auth_id', tutorAuthId)

    if (error) return []
    return (data || []).map((entry) => ({
      tutor_auth_id: entry.tutor_auth_id,
      rater_auth_id: entry.rater_auth_id,
      rating: normalizeToFive(entry.rating),
    }))
  } catch {
    return []
  }
}

export async function getAverageRating(tutorAuthId) {
  const map = readLocal()
  const localEntries = []
  for (const [, raw] of map.entries()) {
    const entry = coerceEntry(raw)
    if (entry && entry.tutor_auth_id === tutorAuthId) localEntries.push(entry)
  }

  const remoteEntries = await loadRemoteEntries(tutorAuthId)
  const mergedEntries = [...localEntries, ...remoteEntries]

  const deduped = []
  const seen = new Set()
  for (const entry of mergedEntries) {
    const key = `${entry.tutor_auth_id}:${entry.rater_auth_id}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(entry)
  }

  if (deduped.length) {
    const sum = deduped.reduce((acc, e) => acc + normalizeToFive(e.rating), 0)
    return { average: sum / deduped.length, count: deduped.length }
  }
}

export async function getMyRatingForTutor(tutorAuthId) {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const map = readLocal()
  const key = `${tutorAuthId}:${userId}`
  const raw = map.get(key)
  if (raw) {
    const parsed = coerceEntry(raw)
    if (parsed) return normalizeToFive(parsed.rating)
  }

  try {
    const { data, error } = await supabase
      .from(RATING_TABLE)
      .select('rating')
      .eq('tutor_auth_id', tutorAuthId)
      .eq('rater_auth_id', userId)
      .maybeSingle()

    if (!error && data) return normalizeToFive(data.rating)
  } catch {
    // ignore
  }

  return null
}

export async function submitRating(tutorAuthId, rating) {
  const userId = (await getCurrentUserId()) || getOrCreateLocalClientId()
  if (!userId) throw new Error('No user id available')

  const normalized = normalizeToFive(rating)
  const map = readLocal()
  const key = `${tutorAuthId}:${userId}`
  const payload = {
    tutor_auth_id: tutorAuthId,
    rater_auth_id: userId,
    rating: normalized,
    updated_at: new Date().toISOString(),
  }
  map.set(key, JSON.stringify(payload))
  writeLocal(map)

  try {
    await supabase.from(RATING_TABLE).upsert(payload, { onConflict: 'tutor_auth_id,rater_auth_id' })
  } catch {
    // keep local storage fallback when Supabase is unavailable
  }

  try {
    const payload = { tutor_auth_id: tutorAuthId, rater_auth_id: userId, rating: normalized }
    const { data, error } = await supabase.from('ratings').upsert(payload, {
      onConflict: ['tutor_auth_id', 'rater_auth_id'],
      returning: 'representation',
    })

    if (error) {
      console.error('submitRating supabase error', error)
      throw error
    }

    try {
      if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('korker-rating-changed', { detail: { tutorAuthId } }))
      }
    } catch {
      // ignore
    }

    return normalized
  } catch (err) {
    console.error('submitRating unexpected error', err)
    throw err
  }

  return normalized
}
