import type { Day, Room, Slot } from './types'

export const DAYS: Day[] = ['thursday', 'friday', 'saturday']

export const ROOMS: Room[] = [1, 2, 3, 4, 5, 6]

export const PROVINCES = [
  'Alajuela',
  'Cartago',
  'Guanacaste',
  'Heredia',
  'Limón',
  'Puntarenas',
  'San José',
] as const

export type Province = typeof PROVINCES[number]

// 15 slots from 15:30 to 17:50, each 10 minutes
export const SLOTS: Slot[] = Array.from({ length: 15 }, (_, i) => {
  const totalMinutes = 15 * 60 + 30 + i * 10
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

export const DAY_LABELS: Record<Day, { es: string; en: string }> = {
  thursday: { es: 'Jueves', en: 'Thursday' },
  friday: { es: 'Viernes', en: 'Friday' },
  saturday: { es: 'Sábado', en: 'Saturday' },
}

export function formatSlot(slot: Slot): string {
  const [hStr, mStr] = slot.split(':')
  const h = parseInt(hStr)
  const m = mStr
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h
  return `${h12}:${m} ${period}`
}
