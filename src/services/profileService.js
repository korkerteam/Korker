import { supabase } from '@/lib/supabase.js'

const TABLE = 'uczniowie'

export async function fetchProfile() {
  const { data, error } = await supabase.from(TABLE).select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile({ name, surname, age, additional }) {
  const existing = await fetchProfile()
  const record = { name, surname, age, additional }

  if (existing) {
    const { error } = await supabase.from(TABLE).update(record).eq('id', existing.id)
    if (error) throw error
    return { ...existing, ...record }
  } else {
    const { data, error } = await supabase.from(TABLE).insert(record).select().single()
    if (error) throw error
    return data
  }
}
