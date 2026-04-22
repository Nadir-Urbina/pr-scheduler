import { adminDb } from '@/lib/firebase/admin'
import type { Day, Room, Slot } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!email) {
    return Response.json({ error: 'validation' }, { status: 400 })
  }

  // Emails stored as-entered; compare lowercase on both sides.
  // Max 270 docs — fetching all is fine at this scale.
  const snapshot = await adminDb.collection('bookings').select('name', 'email', 'day', 'room', 'slot').get()

  const bookings = snapshot.docs
    .filter((doc) => doc.data().email?.trim().toLowerCase() === email)
    .map((doc) => ({
      id: doc.id,
      name: doc.data().name as string,
      day: doc.data().day as Day,
      room: doc.data().room as Room,
      slot: doc.data().slot as Slot,
    }))

  return Response.json({ bookings })
}
