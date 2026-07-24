import { sendEmailNotification } from './emailService.js'

const APP_URL = 'https://korker.edu.pl'

const button = (label) =>
  `<a href="${APP_URL}" style="background:#4a90d9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">${label}</a>`

const wrapper = (content) =>
  `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${content}</div>`

const emailTemplates = {
  newMessage: (senderName, message) => {
    const preview = message.length > 100 ? message.slice(0, 100) + '...' : message
    return {
      subject: `Nowa wiadomość od ${senderName} — Korker`,
      html: wrapper(`
        <h2 style="color:#333;">Nowa wiadomość na Korker</h2>
        <p><strong>${senderName}</strong> wysłał(a) Ci wiadomość:</p>
        <div style="background:#f5f5f5;border-left:4px solid #4a90d9;padding:12px;margin:16px 0;border-radius:4px;">
          ${preview}
        </div>
        <p style="margin-top:20px;">${button('Otwórz Korker')}</p>
      `),
    }
  },

  lessonRequest: (studentName, slotStr) => ({
    subject: 'Nowa prośba o lekcję — Korker',
    html: wrapper(`
      <h2 style="color:#333;">Nowa prośba o lekcję</h2>
      <p><strong>${studentName}</strong> prosi o lekcję.</p>
      ${slotStr ? `<p><strong>Termin:</strong> ${slotStr}</p>` : ''}
      <p style="margin-top:20px;">${button('Sprawdź w kalendarzu')}</p>
    `),
  }),

  lessonApproved: (tutorName, slotStr) => ({
    subject: 'Lekcja zaakceptowana — Korker',
    html: wrapper(`
      <h2 style="color:#4caf50;">Lekcja zaakceptowana</h2>
      <p><strong>${tutorName}</strong> zaakceptował Twoją prośbę o lekcję.</p>
      ${slotStr ? `<p><strong>Termin:</strong> ${slotStr}</p>` : ''}
      <p style="margin-top:20px;">${button('Zobacz w kalendarzu')}</p>
    `),
  }),

  lessonRejected: (tutorName) => ({
    subject: 'Lekcja odrzucona — Korker',
    html: wrapper(`
      <h2 style="color:#f44336;">Lekcja odrzucona</h2>
      <p><strong>${tutorName}</strong> odrzucił Twoją prośbę o lekcję.</p>
      <p style="margin-top:20px;">${button('Sprawdź w kalendarzu')}</p>
    `),
  }),

  lessonCancelled: (cancellerName) => ({
    subject: 'Lekcja anulowana — Korker',
    html: wrapper(`
      <h2 style="color:#f44336;">Lekcja anulowana</h2>
      <p><strong>${cancellerName}</strong> anulował(a) lekcję.</p>
      <p style="margin-top:20px;">${button('Sprawdź w kalendarzu')}</p>
    `),
  }),
}

export function notifyNewMessage(to, senderName, message) {
  const { subject, html } = emailTemplates.newMessage(senderName, message)
  return sendEmailNotification(to, subject, html)
}

export function notifyLessonRequest(to, studentName, slotStr) {
  const { subject, html } = emailTemplates.lessonRequest(studentName, slotStr)
  return sendEmailNotification(to, subject, html)
}

export function notifyLessonApproved(to, tutorName, slotStr) {
  const { subject, html } = emailTemplates.lessonApproved(tutorName, slotStr)
  return sendEmailNotification(to, subject, html)
}

export function notifyLessonRejected(to, tutorName) {
  const { subject, html } = emailTemplates.lessonRejected(tutorName)
  return sendEmailNotification(to, subject, html)
}

export function notifyLessonCancelled(to, cancellerName) {
  const { subject, html } = emailTemplates.lessonCancelled(cancellerName)
  return sendEmailNotification(to, subject, html)
}
