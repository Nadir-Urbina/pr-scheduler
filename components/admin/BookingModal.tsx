'use client'

import { useEffect, useState } from 'react'
import { DAYS, DAY_LABELS, ROOMS, SLOTS, PROVINCES, formatSlot } from '@/lib/schedule'
import { useLang } from '@/lib/context/LanguageContext'
import { adminFetch } from '@/lib/admin-fetch'
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

interface Props {
  booking: Booking | null  // null = create mode
  defaultDay: Day
  onClose: () => void
  onSaved: () => void
}

const t = {
  createTitle: { es: 'Nueva reservación', en: 'New booking' },
  editTitle: { es: 'Editar reservación', en: 'Edit booking' },
  name: { es: 'Nombre completo', en: 'Full name' },
  email: { es: 'Correo electrónico', en: 'Email' },
  province: { es: 'Provincia', en: 'Province' },
  phone: { es: 'Teléfono (opcional)', en: 'Phone (optional)' },
  notes: { es: 'Notas (opcional)', en: 'Notes (optional)' },
  day: { es: 'Día', en: 'Day' },
  room: { es: 'Sala', en: 'Room' },
  slot: { es: 'Horario', en: 'Time slot' },
  save: { es: 'Guardar', en: 'Save' },
  saving: { es: 'Guardando...', en: 'Saving...' },
  cancel: { es: 'Cancelar', en: 'Cancel' },
  slotTaken: { es: 'Ese horario ya está ocupado.', en: 'That slot is already taken.' },
  errGeneric: { es: 'Ocurrió un error. Intenta de nuevo.', en: 'Something went wrong. Try again.' },
}

export default function BookingModal({ booking, defaultDay, onClose, onSaved }: Props) {
  const { lang } = useLang()
  const isEdit = booking !== null

  const [name, setName] = useState(booking?.name ?? '')
  const [email, setEmail] = useState(booking?.email ?? '')
  const [phone, setPhone] = useState(booking?.phone ?? '')
  const [notes, setNotes] = useState(booking?.notes ?? '')
  const [province, setProvince] = useState(booking?.province ?? '')
  const [day, setDay] = useState<Day>(booking?.day ?? defaultDay)
  const [room, setRoom] = useState<Room>(booking?.room ?? 1)
  const [slot, setSlot] = useState(booking?.slot ?? SLOTS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Prevent background scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      province,
      day,
      room,
      slot,
    }

    try {
      const res = isEdit
        ? await adminFetch(`/api/admin/bookings/${booking.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminFetch('/api/admin/bookings', { method: 'POST', body: JSON.stringify(payload) })

      if (res.ok) {
        onSaved()
        return
      }

      const data = await res.json()
      setError(data.error === 'slot_taken' ? t.slotTaken[lang] : t.errGeneric[lang])
    } catch {
      setError(t.errGeneric[lang])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? t.editTitle[lang] : t.createTitle[lang]}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Day */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.day[lang]}</label>
              <select value={day} onChange={(e) => setDay(e.target.value as Day)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800">
                {DAYS.map((d) => (
                  <option key={d} value={d}>{DAY_LABELS[d][lang]}</option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.room[lang]}</label>
              <select value={room} onChange={(e) => setRoom(Number(e.target.value) as Room)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800">
                {ROOMS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Slot */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.slot[lang]}</label>
            <select value={slot} onChange={(e) => setSlot(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800">
              {SLOTS.map((s) => (
                <option key={s} value={s}>{formatSlot(s)}</option>
              ))}
            </select>
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.province[lang]}</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800">
              <option value="">—</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.name[lang]}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.email[lang]}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.phone[lang]}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.notes[lang]}</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 resize-none" />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors">
              {t.cancel[lang]}
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gray-900 text-white font-semibold rounded-xl py-3 text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {saving ? t.saving[lang] : t.save[lang]}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
