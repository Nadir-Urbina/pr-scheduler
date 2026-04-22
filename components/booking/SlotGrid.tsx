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
    <div className="space-y-2">
      {rows.map(({ slot, availableRooms }) => (
        <div key={slot} className="flex items-center gap-3 py-1">
          <span className="text-sm font-mono text-gray-400 w-16 shrink-0">
            {formatSlot(slot)}
          </span>
          <div className="flex flex-wrap gap-2">
            {availableRooms.map((room) => (
              <button
                key={room}
                onClick={() => onSelect(room, slot)}
                className="text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 active:scale-95 transition-all"
              >
                {t.room[lang]} {room}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
