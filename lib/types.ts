import type { Timestamp } from 'firebase/firestore'

export type Day = 'thursday' | 'friday' | 'saturday'

export type Room = 1 | 2 | 3 | 4 | 5 | 6

// Slot start times: 15:30, 15:40, ..., 17:50 (15 slots × 10 min)
export type Slot = string

export interface Booking {
  id: string
  name: string
  email: string
  phone?: string
  notes?: string
  day: Day
  room: Room
  slot: Slot
  createdAt: Timestamp
}

// Shape used when creating a new booking (no id/createdAt yet)
export type NewBooking = Omit<Booking, 'id' | 'createdAt'>
