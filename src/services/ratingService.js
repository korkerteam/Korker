import { supabase } from '@/lib/supabase.js'

function normalizeToFive(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(5, n))
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
  if (!tutorAuthId) return { average: 0, count: 0 }
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('tutor_auth_id', tutorAuthId)

    if (error) {
      console.error('getAverageRating supabase error', error)
      return { average: 0, count: 0 }
    }

    if (!data || data.length === 0) return { average: 0, count: 0 }
    const sum = data.reduce((acc, r) => acc + normalizeToFive(r.rating), 0)
    return { average: sum / data.length, count: data.length }
  } catch (err) {
    console.error('getAverageRating unexpected error', err)
    return { average: 0, count: 0 }
  }
}

export async function getMyRatingForTutor(tutorAuthId) {
  const userId = await getCurrentUserId()
  if (!userId) return null
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('tutor_auth_id', tutorAuthId)
      .eq('rater_auth_id', userId)
      .single()

    if (error) {
      // no rating yet or access denied
      return null
    }
    return normalizeToFive(data.rating)
  } catch (err) {
    console.error('getMyRatingForTutor unexpected error', err)
    return null
  }
}

export async function submitRating(tutorAuthId, rating) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Authentication required to submit rating')
  const normalized = Math.max(1, normalizeToFive(rating))
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
}
