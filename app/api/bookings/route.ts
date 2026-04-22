import { adminDb } from '@/lib/firebase/admin'
import { DAYS, ROOMS, SLOTS, PROVINCES } from '@/lib/schedule'
import type { Day, NewBooking, Room, Slot } from '@/lib/types'
import { FieldValue } from 'firebase-admin/firestore'
import { resend, FROM } from '@/lib/email/resend'
import { confirmationEmail } from '@/lib/email/templates'

// Strips accents (é→e, á→a, etc.), lowercases, collapses whitespace
function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[a.length][b.length]
}

// 1 edit allowed for short names (≤6 chars), 2 for longer
function isSimilarName(a: string, b: string): boolean {
  if (a === b) return true
  const threshold = a.length <= 6 ? 1 : 2
  return levenshtein(a, b) <= threshold
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const day = searchParams.get('day')

  if (!day || !DAYS.includes(day as Day)) {
    return Response.json({ error: 'validation' }, { status: 400 })
  }

  const snapshot = await adminDb
    .collection('bookings')
    .where('day', '==', day)
    .select('room', 'slot')
    .get()

  const taken = snapshot.docs.map((doc) => ({
    room: doc.data().room as Room,
    slot: doc.data().slot as Slot,
  }))

  return Response.json({ taken })
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { name, email, phone, notes, province, day, room, slot, lang } = body as Record<string, unknown>

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof province !== 'string' || !province.trim() ||
    typeof day !== 'string' ||
    typeof slot !== 'string' ||
    typeof room !== 'number'
  ) {
    return Response.json({ error: 'validation' }, { status: 400 })
  }

  if (!DAYS.includes(day as never)) {
    return Response.json({ error: 'validation', field: 'day' }, { status: 400 })
  }

  if (!ROOMS.includes(room as never)) {
    return Response.json({ error: 'validation', field: 'room' }, { status: 400 })
  }

  if (!SLOTS.includes(slot)) {
    return Response.json({ error: 'validation', field: 'slot' }, { status: 400 })
  }

  if (!PROVINCES.includes(province as never)) {
    return Response.json({ error: 'validation', field: 'province' }, { status: 400 })
  }

  const submittedName = normalizeName(name)

  // Fetch all stored normalized names and fuzzy-match against the submitted name.
  // Max 270 documents — acceptable to load all at this scale.
  const bookingsRef = adminDb.collection('bookings')
  const allNames = await bookingsRef.select('nameNormalized').get()

  const isDuplicate = allNames.docs.some((doc) =>
    isSimilarName(submittedName, doc.data().nameNormalized ?? '')
  )

  if (isDuplicate) {
    return Response.json(
      {
        error: 'duplicate',
        message: {
          es: 'Ya existe una reservación con ese nombre. Solo se permite una sesión por persona.',
          en: 'A booking already exists with that name. Only one session per person is allowed.',
        },
      },
      { status: 409 }
    )
  }

  const newBooking: NewBooking & { nameNormalized: string } = {
    name: name.trim(),
    email: email.trim(),
    nameNormalized: submittedName,
    province: province.trim(),
    day: day as NewBooking['day'],
    room: room as NewBooking['room'],
    slot,
    ...(typeof phone === 'string' && phone.trim() ? { phone: phone.trim() } : {}),
    ...(typeof notes === 'string' && notes.trim() ? { notes: notes.trim() } : {}),
  }

  const docRef = await bookingsRef.add({
    ...newBooking,
    createdAt: FieldValue.serverTimestamp(),
  })

  const emailLang = lang === 'en' ? 'en' : 'es'
  const { subject, html } = confirmationEmail({
    name: name.trim(),
    day: day as Day,
    room: room as Room,
    slot,
    lang: emailLang,
  })

  // Await so the serverless function doesn't terminate before Resend completes.
  // Swallow errors so a failed email never blocks a confirmed booking.
  await resend.emails.send({ from: FROM, to: email.trim(), subject, html }).catch(() => {})

  return Response.json({ success: true, id: docRef.id }, { status: 201 })
}
