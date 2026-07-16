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

const LIMITS = {
  nickname: 30,
  name: 30,
  surname: 30,
  city: 50,
  street: 50,
  homeNumber: 10,
  flatNumber: 10,
  subject: 50,
  description: 300,
}

export async function upsertProfile(
  { nickname, name, surname, age, gender, account_type, city, profile_picture },
  userId,
  tutor_post = null,
) {
  const uid = await resolveUserId(userId)
  if (!uid) throw new Error('Not authenticated')

  if ((!nickname || !nickname.trim()) && (!name || !name.trim()))
    throw new Error('Pseudonim lub imię i nazwisko jest wymagane')
  if (nickname && nickname.length > LIMITS.nickname)
    throw new Error(`Pseudonim może mieć maksymalnie ${LIMITS.nickname} znaków`)
  if (name && name.length > LIMITS.name)
    throw new Error(`Imię może mieć maksymalnie ${LIMITS.name} znaków`)
  if (surname && surname.length > LIMITS.surname)
    throw new Error(`Nazwisko może mieć maksymalnie ${LIMITS.surname} znaków`)
  if (city && city.length > LIMITS.city)
    throw new Error(`Miasto może mieć maksymalnie ${LIMITS.city} znaków`)

  const trimmedNickname = nickname?.trim()
  if (trimmedNickname) {
    const { data: duplicate, error: dupError } = await supabase
      .from(TABLE)
      .select('auth_id')
      .eq('nickname', trimmedNickname)
      .neq('auth_id', uid)
      .maybeSingle()
    if (dupError) throw dupError
    if (duplicate) throw new Error('Ten pseudonim jest już zajęty')
  }

  if (tutor_post) {
    if (tutor_post.street?.length > LIMITS.street)
      throw new Error(`Ulica może mieć maksymalnie ${LIMITS.street} znaków`)
    if (tutor_post.homeNumber?.length > LIMITS.homeNumber)
      throw new Error(`Numer domu może mieć maksymalnie ${LIMITS.homeNumber} znaków`)
    if (tutor_post.flatNumber?.length > LIMITS.flatNumber)
      throw new Error(`Numer mieszkania może mieć maksymalnie ${LIMITS.flatNumber} znaków`)
    if (tutor_post.subject?.length > LIMITS.subject)
      throw new Error(`Przedmiot może mieć maksymalnie ${LIMITS.subject} znaków`)
    if (tutor_post.description?.length > LIMITS.description)
      throw new Error(`Opis może mieć maksymalnie ${LIMITS.description} znaków`)
  }

  const existing = await fetchProfile(uid)

  const record = {
    nickname,
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
