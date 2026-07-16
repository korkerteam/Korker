import { supabase } from '@/lib/supabase.js'

export async function fetchSavedTutorIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('users')
    .select('saved_tutors')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data?.saved_tutors || []
}

export async function addSavedTutor(authId) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('users')
    .select('saved_tutors')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (error) throw error

  const current = data?.saved_tutors || []
  if (current.includes(authId)) return

  const { error: updateError } = await supabase
    .from('users')
    .update({ saved_tutors: [...current, authId] })
    .eq('auth_id', user.id)

  if (updateError) throw updateError
}

export async function removeSavedTutor(authId) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('users')
    .select('saved_tutors')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (error) throw error

  const current = data?.saved_tutors || []
  const updated = current.filter((id) => id !== authId)

  const { error: updateError } = await supabase
    .from('users')
    .update({ saved_tutors: updated })
    .eq('auth_id', user.id)

  if (updateError) throw updateError
}

export async function fetchTutorProfiles(authIds) {
  if (!authIds.length) return []

  const { data, error } = await supabase.from('users').select('*').in('auth_id', authIds)

  if (error) throw error
  return data || []
}
