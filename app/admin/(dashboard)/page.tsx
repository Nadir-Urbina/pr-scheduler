'use client'

import { useCallback, useEffect, useState } from 'react'
import { DAY_LABELS, DAYS, formatSlot } from '@/lib/schedule'
import { useLang } from '@/lib/context/LanguageContext'
import { adminFetch } from '@/lib/admin-fetch'
import BookingModal from '@/components/admin/BookingModal'
import type { Day, Room } from '@/lib/types'

interface Booking {
  id: string
  name: string
  email: string
  phone?: string
  notes?: string
  province: string
  day: Day
  room: Room
  slot: string
}

const t = {
  title: { es: 'Reservaciones', en: 'Bookings' },
  newBooking: { es: 'Nueva reservación', en: 'New booking' },
  time: { es: 'Hora', en: 'Time' },
  room: { es: 'Sala', en: 'Room' },
  name: { es: 'Nombre', en: 'Name' },
  email: { es: 'Correo', en: 'Email' },
  phone: { es: 'Teléfono', en: 'Phone' },
  notes: { es: 'Notas', en: 'Notes' },
  province: { es: 'Provincia', en: 'Province' },
  actions: { es: 'Acciones', en: 'Actions' },
  noBookings: { es: 'No hay reservaciones para este día.', en: 'No bookings for this day.' },
  loading: { es: 'Cargando...', en: 'Loading...' },
  deleteConfirm: { es: '¿Eliminar esta reservación?', en: 'Delete this booking?' },
  deleteErr: { es: 'Error al eliminar. Intenta de nuevo.', en: 'Failed to delete. Try again.' },
  total: { es: 'Total', en: 'Total' },
}

export default function AdminDashboardPage() {
  const { lang } = useLang()
  const [selectedDay, setSelectedDay] = useState<Day>('thursday')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch(`/api/admin/bookings?day=${selectedDay}`)
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } finally {
      setLoading(false)
    }
  }, [selectedDay])

  useEffect(() => { loadBookings() }, [loadBookings])

  async function handleDelete(booking: Booking) {
    const msg = `${t.deleteConfirm[lang]}\n${booking.name} — ${formatSlot(booking.slot)}, ${t.room[lang]} ${booking.room}`
    if (!confirm(msg)) return

    try {
      await adminFetch(`/api/admin/bookings/${booking.id}`, { method: 'DELETE' })
      setBookings((prev) => prev.filter((b) => b.id !== booking.id))
    } catch {
      alert(t.deleteErr[lang])
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.title[lang]}</h1>
        <button
          onClick={() => setModal({ open: true, booking: null })}
          className="bg-gray-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-gray-700 transition-colors"
        >
          + {t.newBooking[lang]}
        </button>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedDay === day
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {DAY_LABELS[day][lang]}
          </button>
        ))}
      </div>

      {/* Bookings count */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-3">
          {t.total[lang]}: <span className="font-semibold text-gray-600">{bookings.length}</span>
        </p>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-400 py-10 text-center animate-pulse">{t.loading[lang]}</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">{t.noBookings[lang]}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[t.time, t.room, t.name, t.email, t.province, t.phone, t.notes, t.actions].map((col) => (
                  <th key={col[lang]} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col[lang]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-600 whitespace-nowrap">{formatSlot(booking.slot)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{booking.room}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{booking.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{booking.email}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{booking.province}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{booking.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{booking.notes ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ open: true, booking })}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(booking)}
                        className="text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <BookingModal
          booking={modal.booking}
          defaultDay={selectedDay}
          onClose={() => setModal({ open: false, booking: null })}
          onSaved={() => {
            setModal({ open: false, booking: null })
            loadBookings()
          }}
        />
      )}
    </>
  )
}
