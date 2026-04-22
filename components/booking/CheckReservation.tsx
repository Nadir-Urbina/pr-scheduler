'use client'

import { useState } from 'react'
import { DAY_LABELS, formatSlot } from '@/lib/schedule'
import { useLang } from '@/lib/context/LanguageContext'
import type { Day, Room, Slot } from '@/lib/types'

interface Booking {
  id: string
  name: string
  day: Day
  room: Room
  slot: Slot
}


const t = {
  heading: { es: '¿Ya tienes una reservación?', en: 'Already have a booking?' },
  label: { es: 'Ingresa tu correo electrónico', en: 'Enter your email address' },
  button: { es: 'Consultar', en: 'Look up' },
  looking: { es: 'Buscando...', en: 'Looking up...' },
  notFound: {
    es: 'No encontramos reservaciones con ese correo.',
    en: 'No bookings found for that email.',
  },
  error: { es: 'Ocurrió un error. Intenta de nuevo.', en: 'Something went wrong. Try again.' },
  room: { es: 'Sala', en: 'Room' },
  yourBookings: { es: 'Tus reservaciones', en: 'Your bookings' },
}

export default function CheckReservation() {
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [error, setError] = useState(false)

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setBookings(null)
    setError(false)

    try {
      const res = await fetch(`/api/reservations?email=${encodeURIComponent(email.trim())}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBookings(data.bookings)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        {t.heading[lang]}
      </h2>

      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setBookings(null)
            setError(false)
          }}
          placeholder={t.label[lang]}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="shrink-0 bg-gray-800 text-white font-semibold rounded-xl px-4 py-3 text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? t.looking[lang] : t.button[lang]}
        </button>
      </form>

      {/* Results */}
      {bookings !== null && bookings.length === 0 && (
        <p className="text-sm text-gray-400 mt-4">{t.notFound[lang]}</p>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-4">{t.error[lang]}</p>
      )}

      {bookings && bookings.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {t.yourBookings[lang]}
          </p>
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3"
            >
              <p className="font-semibold text-gray-800 text-sm">
                {DAY_LABELS[b.day][lang]} · {formatSlot(b.slot)} · {t.room[lang]} {b.room}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{b.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
