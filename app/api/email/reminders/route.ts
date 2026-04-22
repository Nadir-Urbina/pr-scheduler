import { adminDb } from '@/lib/firebase/admin'
import { resend, FROM } from '@/lib/email/resend'
import { reminderEmail } from '@/lib/email/templates'
import type { Day, Room } from '@/lib/types'

// UTC day-of-week → conference day
// Cron fires Thu/Fri/Sat at 01:00 UTC (= Wed/Thu/Fri 7PM Costa Rica, UTC-6)
const UTC_DAY_TO_CONFERENCE: Record<number, Day> = {
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

export async function GET(request: Request) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> on cron invocations.
  // You can also pass ?secret= when testing locally.
  const authHeader = request.headers.get('authorization') ?? ''
  const querySecret = new URL(request.url).searchParams.get('secret') ?? ''
  const provided = authHeader.replace('Bearer ', '') || querySecret
  if (!provided || provided !== process.env.CRON_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const utcDay = new Date().getUTCDay()
  const day = UTC_DAY_TO_CONFERENCE[utcDay]

  if (!day) {
    return Response.json({ skipped: true, utcDay })
  }

  const snapshot = await adminDb.collection('bookings').where('day', '==', day).get()

  const results = await Promise.allSettled(
    snapshot.docs.map(async (doc) => {
      const { name, email, room, slot } = doc.data() as {
        name: string
        email: string
        room: Room
        slot: string
      }
      const { subject, html } = reminderEmail({ name, day, room, slot })
      await resend.emails.send({ from: FROM, to: email, subject, html })
      return email
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return Response.json({ day, sent, failed })
}
