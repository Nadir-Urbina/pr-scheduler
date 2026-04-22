import { DAY_LABELS, formatSlot } from '@/lib/schedule'
import { CHURCH_ADDRESS } from './resend'
import type { Day, Room, Slot } from '@/lib/types'

type Lang = 'es' | 'en'

const LOGO_TEXT = 'La Cresta de La Ola'

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <!-- Header -->
        <tr>
          <td style="background:#111827;padding:24px 32px;text-align:center;">
            <img src="https://pr-scheduler-silk.vercel.app/cotw.png" alt="${LOGO_TEXT}" width="120" style="display:block;margin:0 auto 12px;border-radius:12px;" />
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${LOGO_TEXT}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              ${CHURCH_ADDRESS}<br>
              Este correo fue enviado desde <a href="mailto:LaCresta@drjoshuatodd.com" style="color:#6b7280;">LaCresta@drjoshuatodd.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function slot_card(label: string, value: string): string {
  return `<tr>
    <td style="padding:4px 0;font-size:13px;color:#6b7280;width:80px;">${label}</td>
    <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:600;">${value}</td>
  </tr>`
}

export function confirmationEmail({
  name,
  day,
  room,
  slot,
  lang,
}: {
  name: string
  day: Day
  room: Room
  slot: Slot
  lang: Lang
}): { subject: string; html: string } {
  const dayLabel = DAY_LABELS[day][lang]
  const time = formatSlot(slot)

  const subject =
    lang === 'es'
      ? `✅ Reservación confirmada — ${dayLabel} ${time}`
      : `✅ Booking confirmed — ${dayLabel} ${time}`

  const greeting = lang === 'es' ? `Hola, ${name}` : `Hi, ${name}`

  const intro =
    lang === 'es'
      ? 'Tu reservación ha sido confirmada. Te esperamos.'
      : 'Your booking is confirmed. We look forward to seeing you.'

  const dayRow = lang === 'es' ? 'Día' : 'Day'
  const timeRow = lang === 'es' ? 'Hora' : 'Time'
  const roomRow = lang === 'es' ? 'Sala' : 'Room'
  const addressRow = lang === 'es' ? 'Lugar' : 'Location'

  const reminder =
    lang === 'es'
      ? 'Recuerda llegar <strong>10–15 minutos antes</strong>. Las sesiones duran solo 10 minutos.'
      : 'Please arrive <strong>10–15 minutes early</strong>. Sessions are only 10 minutes long.'

  const record =
    lang === 'es'
      ? 'Te recomendamos <strong>grabar tu sesión</strong> para que puedas compartirla con tus líderes.'
      : 'We recommend <strong>recording your session</strong> so you can share it with your leaders.'

  const html = base(`
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">${intro}</p>

    <table cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:24px;width:100%;">
      <tbody>
        ${slot_card(dayRow, dayLabel)}
        ${slot_card(timeRow, time)}
        ${slot_card(roomRow, `${roomRow} ${room}`)}
        ${slot_card(addressRow, CHURCH_ADDRESS)}
      </tbody>
    </table>

    <p style="margin:0 0 12px;font-size:14px;color:#4b5563;line-height:1.6;">${reminder}</p>
    <p style="margin:0 0 12px;font-size:14px;color:#4b5563;line-height:1.6;">${record}</p>
    <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">El servicio nocturno inicia en el mismo lugar a las <strong>6:30 PM</strong>. ¡Te esperamos!</p>
  `)

  return { subject, html }
}

export function reminderEmail({
  name,
  day,
  room,
  slot,
}: {
  name: string
  day: Day
  room: Room
  slot: Slot
}): { subject: string; html: string } {
  const dayEs = DAY_LABELS[day].es
  const time = formatSlot(slot)

  const subject = `⏰ Recordatorio — ${dayEs} ${time}`

  const html = base(`
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;">Hola, ${name} 👋</p>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">Te recordamos que mañana tienes una sesión reservada.</p>

    <table cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:24px;width:100%;">
      <tbody>
        ${slot_card('Día', dayEs)}
        ${slot_card('Hora', time)}
        ${slot_card('Sala', `Sala ${room}`)}
        ${slot_card('Lugar', CHURCH_ADDRESS)}
      </tbody>
    </table>

    <p style="margin:0 0 12px;font-size:14px;color:#4b5563;line-height:1.6;">Recuerda llegar <strong>10–15 minutos antes</strong>. Las sesiones duran solo 10 minutos.</p>
    <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">El servicio nocturno inicia en el mismo lugar a las <strong>6:30 PM</strong>. ¡Te esperamos!</p>
  `)

  return { subject, html }
}
