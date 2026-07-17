import { supabase } from '@/lib/supabase.js'

export async function blockUser(blockedId) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (user.id === blockedId) throw new Error('Cannot block yourself')

  const { data: existing } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('blocked_users')
      .update({ unblocked_at: null, blocked_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('blocked_users')
      .insert({ blocker_id: user.id, blocked_id: blockedId })
    if (error) throw error
  }
}

export async function unblockUser(blockedId) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('blocked_users')
    .update({ unblocked_at: new Date().toISOString() })
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId)
    .is('unblocked_at', null)
  if (error) throw error
}

export async function isBlockedByMe(targetId) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetId)
    .is('unblocked_at', null)
    .maybeSingle()

  return !!data
}

export async function isBlockingMe(targetId) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', targetId)
    .eq('blocked_id', user.id)
    .is('unblocked_at', null)
    .maybeSingle()

  return !!data
}

export async function getBlockedIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', user.id)
    .is('unblocked_at', null)

  return (data || []).map((r) => r.blocked_id)
}

export async function getBlockingMeIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('blocked_users')
    .select('blocker_id')
    .eq('blocked_id', user.id)
    .is('unblocked_at', null)

  return (data || []).map((r) => r.blocker_id)
}

export async function getBlockedPeriods() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('blocked_users')
    .select('blocked_id, blocked_at, unblocked_at')
    .eq('blocker_id', user.id)

  return data || []
}
