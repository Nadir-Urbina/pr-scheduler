'use client'

import { useState } from 'react'
import { DAY_LABELS, formatSlot, PROVINCES } from '@/lib/schedule'
import { useLang } from '@/lib/context/LanguageContext'
import type { Day, Room, Slot } from '@/lib/types'

interface Props {
  day: Day
  room: Room
  slot: Slot
  onBack: () => void
  onSuccess: () => void
}

const t = {
  back: { es: 'Volver', en: 'Back' },
  yourSlot: { es: 'Tu horario seleccionado', en: 'Your selected slot' },
  room: { es: 'Sala', en: 'Room' },
  name: { es: 'Nombre completo', en: 'Full name' },
  email: { es: 'Correo electrónico', en: 'Email address' },
  phone: { es: 'Teléfono (opcional)', en: 'Phone (optional)' },
  notes: { es: 'Notas (opcional)', en: 'Notes (optional)' },
  province: { es: 'Provincia', en: 'Province' },
  provincePlaceholder: { es: '— Selecciona tu provincia —', en: '— Select your province —' },
  submit: { es: 'Confirmar reservación', en: 'Confirm booking' },
  submitting: { es: 'Reservando...', en: 'Booking...' },
  required: { es: 'Este campo es requerido.', en: 'This field is required.' },
  invalidEmail: {
    es: 'Ingresa un correo electrónico válido.',
    en: 'Enter a valid email address.',
  },
  successTitle: { es: '¡Reservación confirmada!', en: 'Booking confirmed!' },
  successBody: {
    es: 'Te esperamos. Recuerda llegar 10–15 minutos antes — las sesiones duran solo 10 minutos.',
    en: 'We look forward to seeing you. Remember to arrive 10–15 minutes early — sessions are only 10 minutes long.',
  },
  spamNotice: {
    es: 'Recibirás un correo de confirmación de LaCresta@drjoshuatodd.com. Si no lo ves, revisa tu carpeta de spam o correo no deseado.',
    en: 'A confirmation email will be sent from LaCresta@drjoshuatodd.com. If you don\'t see it, check your spam or junk folder.',
  },
  bookAnother: {
    es: 'Reservar otro espacio',
    en: 'Book another slot',
  },
}

interface FormState {
  name: string
  email: string
  phone: string
  notes: string
  province: string
}

interface FormErrors {
  name?: string
  email?: string
  province?: string
}

export default function BookingForm({ day, room, slot, onBack, onSuccess }: Props) {
  const { lang } = useLang()
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', notes: '', province: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = t.required[lang]
    if (!form.email.trim()) {
      e.email = t.required[lang]
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = t.invalidEmail[lang]
    }
    if (!form.province) e.province = t.required[lang]
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setApiError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          notes: form.notes.trim() || undefined,
          province: form.province,
          day,
          room,
          slot,
          lang,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        return
      }

      const data = await res.json()
      if (data.error === 'duplicate') {
        setApiError(data.message[lang])
      } else {
        setApiError(lang === 'es' ? 'Ocurrió un error. Intenta de nuevo.' : 'Something went wrong. Please try again.')
      }
    } catch {
      setApiError(lang === 'es' ? 'Ocurrió un error. Intenta de nuevo.' : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">{t.successTitle[lang]}</h2>
        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-left">
          <p className="font-semibold text-gray-800">
            {DAY_LABELS[day][lang]} · {formatSlot(slot)} · {t.room[lang]} {room}
          </p>
          <p className="mt-1">{form.name}</p>
        </div>
        <p className="text-sm text-gray-500 mb-3">{t.successBody[lang]}</p>
        <p className="text-xs text-gray-400 mb-6">{t.spamNotice[lang]}</p>
        <button
          onClick={onSuccess}
          className="w-full border border-blue-300 text-blue-600 font-semibold rounded-xl px-4 py-3 text-base hover:bg-blue-50 transition-colors"
        >
          {t.bookAnother[lang]}
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Back + slot summary */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-blue-600 hover:underline mb-4"
      >
        ← {t.back[lang]}
      </button>

      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          {t.yourSlot[lang]}
        </p>
        <p className="font-semibold text-gray-800">
          {DAY_LABELS[day][lang]} · {formatSlot(slot)} · {t.room[lang]} {room}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t.name[lang]}
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full border rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t.email[lang]}
          </label>
          <input
            type="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full border rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t.province[lang]}
          </label>
          <select
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            className={`w-full border rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.province ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">{t.provincePlaceholder[lang]}</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t.phone[lang]}
          </label>
          <input
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t.notes[lang]}
          </label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* API error */}
        {apiError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl px-4 py-3 text-base hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {submitting ? t.submitting[lang] : t.submit[lang]}
        </button>
      </form>
    </div>
  )
}
