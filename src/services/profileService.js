import { supabase } from '@/lib/supabase.js'

const TABLE = 'users'

async function resolveUserId(userId) {
  if (userId) return userId
  const { data } = await supabase.auth.getUser()
  return data?.user?.id
}

export async function fetchProfile(userId) {
  const uid = await resolveUserId(userId)
  if (!uid) throw new Error('Not authenticated')

  const { data, error } = await supabase.from(TABLE).select('*').eq('auth_id', uid).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile(
  { name, surname, age, gender, account_type, city, profile_picture },
  userId,
  tutor_post = null,
) {
  const uid = await resolveUserId(userId)
  if (!uid) throw new Error('Not authenticated')

  const existing = await fetchProfile(uid)

  const record = {
    name,
    surname,
    age,
    gender,
    account_type,
    city,
    profile_picture,
    tutor_post,
  }

  if (existing) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(record)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...record, auth_id: uid })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function deleteProfile(userId) {
  const uid = await resolveUserId(userId)
  if (!uid) throw new Error('Not authenticated')

  const existing = await fetchProfile(uid)
  if (existing) {
    const { error } = await supabase.from(TABLE).delete().eq('id', existing.id)
    if (error) throw error
  }

  const { error: rpcError } = await supabase.rpc('delete_user')
  if (rpcError) throw rpcError
}
