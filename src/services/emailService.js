import { supabase } from '@/lib/supabase.js'

export async function sendEmailNotification(to, subject, html) {
  if (!to) {
    console.warn('[email] No recipient, skipping')
    return
  }
  console.log('[email] Sending to:', to, '| Subject:', subject)
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    })
    if (error) {
      console.error('[email] Function error:', error)
    } else {
      console.log('[email] Success:', data)
    }
  } catch (err) {
    console.error('[email] Invoke failed:', err)
  }
}
