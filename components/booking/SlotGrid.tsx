'use client'

import { useEffect, useState } from 'react'
import { ROOMS, SLOTS, formatSlot } from '@/lib/schedule'
import { useLang } from '@/lib/context/LanguageContext'
import type { Day, Room, Slot } from '@/lib/types'

interface TakenSlot {
  room: Room
  slot: Slot
}

interface Props {
  day: Day
  onSelect: (room: Room, slot: Slot) => void
}

const t = {
  loading: { es: 'Cargando horarios...', en: 'Loading slots...' },
  error: { es: 'Error al cargar horarios.', en: 'Failed to load slots.' },
  noSlots: { es: 'No hay horarios disponibles para este día.', en: 'No available slots for this day.' },
  room: { es: 'Sala', en: 'Room' },
  pickRoom: { es: 'Elige una sala', en: 'Pick a room' },
}

export default function SlotGrid({ day, onSelect }: Props) {
  const { lang } = useLang()
  const [taken, setTaken] = useState<TakenSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/bookings?day=${day}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        setTaken(data.taken ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [day])

  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-10 animate-pulse">{t.loading[lang]}</p>
  }

  if (error) {
    return <p className="text-sm text-red-500 text-center py-10">{t.error[lang]}</p>
  }

  const takenSet = new Set(taken.map((t) => `${t.room}-${t.slot}`))
  const rows = SLOTS.map((slot) => ({
    slot,
    availableRooms: ROOMS.filter((room) => !takenSet.has(`${room}-${slot}`)),
  })).filter((row) => row.availableRooms.length > 0)

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-10">{t.noSlots[lang]}</p>
  }

  return (
    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
      {rows.map(({ slot, availableRooms }) => (
        <div key={slot} className="flex items-center gap-3 px-4 py-3 bg-white">
          <span className="text-sm font-mono text-gray-500 w-16 shrink-0">
            {formatSlot(slot)}
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              const room = Number(e.target.value) as Room
              if (room) onSelect(room, slot)
            }}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" disabled>{t.pickRoom[lang]}</option>
            {availableRooms.map((room) => (
              <option key={room} value={room}>
                {t.room[lang]} {room}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
