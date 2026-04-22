import { adminDb } from '@/lib/firebase/admin'
import { verifyAdminToken } from '@/lib/admin-auth'
import { DAYS, ROOMS, SLOTS } from '@/lib/schedule'
import type { Day, Room } from '@/lib/types'

export async function PUT(request: Request, ctx: RouteContext<'/api/admin/bookings/[id]'>) {
  if (!await verifyAdminToken(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params

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

  // Check the target slot isn't taken by a different booking
  const slotTaken = await adminDb.collection('bookings')
    .where('day', '==', day)
    .where('room', '==', room)
    .where('slot', '==', slot)
    .limit(1)
    .get()

  if (!slotTaken.empty && slotTaken.docs[0].id !== id) {
    return Response.json({ error: 'slot_taken' }, { status: 409 })
  }

  const update: Record<string, unknown> = {
    name: name.trim(),
    email: email.trim(),
    nameNormalized: name.trim().toLowerCase(),
    day,
    room,
    slot,
    phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
    notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
  }

  // Remove null fields rather than storing them
  Object.keys(update).forEach((k) => update[k] === null && delete update[k])

  await adminDb.collection('bookings').doc(id).update(update)

  return Response.json({ success: true })
}

export async function DELETE(request: Request, ctx: RouteContext<'/api/admin/bookings/[id]'>) {
  if (!await verifyAdminToken(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  await adminDb.collection('bookings').doc(id).delete()
  return Response.json({ success: true })
}
