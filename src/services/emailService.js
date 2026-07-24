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

export function buildChatEmailHtml(senderName, message) {
  const preview = message.length > 100 ? message.slice(0, 100) + '...' : message
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#333;">Nowa wiadomość na Korker</h2>
      <p><strong>${senderName}</strong> wysłał(a) Ci wiadomość:</p>
      <div style="background:#f5f5f5;border-left:4px solid #4a90d9;padding:12px;margin:16px 0;border-radius:4px;">
        ${preview}
      </div>
      <p style="margin-top:20px;">
        <a href="https://korker.edu.pl" style="background:#4a90d9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
          Otwórz Korker
        </a>
      </p>
    </div>
  `
}

export function buildLessonRequestEmailHtml(tutorName, slotStr) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#333;">Nowa prośba o lekcję</h2>
      <p><strong>${tutorName}</strong> prosi o lekcję.</p>
      ${slotStr ? `<p><strong>Termin:</strong> ${slotStr}</p>` : ''}
      <p style="margin-top:20px;">
        <a href="https://korker.edu.pl" style="background:#4a90d9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
          Sprawdź w kalendarzu
        </a>
      </p>
    </div>
  `
}

export function buildLessonApprovedEmailHtml(tutorName, slotStr) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#4caf50;">Lekcja zaakceptowana</h2>
      <p><strong>${tutorName}</strong> zaakceptował Twoją prośbę o lekcję.</p>
      ${slotStr ? `<p><strong>Termin:</strong> ${slotStr}</p>` : ''}
      <p style="margin-top:20px;">
        <a href="https://korker.edu.pl" style="background:#4a90d9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
          Zobacz w kalendarzu
        </a>
      </p>
    </div>
  `
}

export function buildLessonRejectedEmailHtml(tutorName) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#f44336;">Lekcja odrzucona</h2>
      <p><strong>${tutorName}</strong> odrzucił Twoją prośbę o lekcję.</p>
      <p style="margin-top:20px;">
        <a href="https://korker.edu.pl" style="background:#4a90d9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
          Sprawdź w kalendarzu
        </a>
      </p>
    </div>
  `
}
