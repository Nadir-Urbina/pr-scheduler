import { adminDb } from '@/lib/firebase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'
import { DAYS, ROOMS, SLOTS } from '@/lib/schedule'
import { FieldValue } from 'firebase-admin/firestore'
import type { Day, Room } from '@/lib/types'

export async function GET(request: Request) {
  if (!await verifyAdminToken(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const day = searchParams.get('day')

  if (!day || !DAYS.includes(day as Day)) {
    return Response.json({ error: 'validation' }, { status: 400 })
  }

  const snapshot = await adminDb.collection('bookings').where('day', '==', day).get()

  const bookings = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() ?? null,
    }))
    .sort((a, b) => {
      if (a.slot !== b.slot) return a.slot.localeCompare(b.slot)
      return (a.room as number) - (b.room as number)
    })

  return Response.json({ bookings })
}

export async function POST(request: Request) {
  if (!await verifyAdminToken(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { name, email, phone, notes, day, room, slot } = body as Record<string, unknown>

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof day !== 'string' || !DAYS.includes(day as Day) ||
    typeof slot !== 'string' || !SLOTS.includes(slot) ||
    typeof room !== 'number' || !ROOMS.includes(room as Room)
  ) {
    return Response.json({ error: 'validation' }, { status: 400 })
  }

  // Check slot availability (admin bypasses name duplicate check)
  const slotTaken = await adminDb.collection('bookings')
    .where('day', '==', day)
    .where('room', '==', room)
    .where('slot', '==', slot)
    .limit(1)
    .get()

  if (!slotTaken.empty) {
    return Response.json({ error: 'slot_taken' }, { status: 409 })
  }

  const docRef = await adminDb.collection('bookings').add({
    name: name.trim(),
    email: email.trim(),
    nameNormalized: name.trim().toLowerCase(),
    day,
    room,
    slot,
    ...(typeof phone === 'string' && phone.trim() ? { phone: phone.trim() } : {}),
    ...(typeof notes === 'string' && notes.trim() ? { notes: notes.trim() } : {}),
    createdAt: FieldValue.serverTimestamp(),
  })

  return Response.json({ success: true, id: docRef.id }, { status: 201 })
}
