'use client'

import { useState } from 'react'
import { DAYS, DAY_LABELS } from '@/lib/schedule'
import { useLang } from '@/lib/context/LanguageContext'
import type { Day, Room, Slot } from '@/lib/types'
import LangToggle from '@/components/LangToggle'
import SlotGrid from './SlotGrid'
import BookingForm from './BookingForm'
import CheckReservation from './CheckReservation'

const t = {
  title: { es: 'Reserva tu Sesión', en: 'Book Your Session' },
  subtitle: { es: 'Sesiones proféticas · La Cresta de La Ola', en: 'Prophetic sessions · La Cresta de La Ola' },
  selectDay: { es: 'Selecciona un día', en: 'Select a day' },
  dayPlaceholder: { es: '— Elige un día —', en: '— Choose a day —' },
  selectSlot: { es: 'Elige un horario disponible', en: 'Choose an available time slot' },
}

interface SelectedSlot {
  room: Room
  slot: Slot
}

export default function BookingPage() {
  const { lang } = useLang()
  const [selectedDay, setSelectedDay] = useState<Day | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {t.title[lang]}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle[lang]}</p>
          </div>
          <LangToggle className="shrink-0 ml-4" />
        </div>

        {/* Day selector — hidden once a slot is selected */}
        <div className={`mb-6 ${selectedSlot ? 'hidden' : ''}`}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.selectDay[lang]}
          </label>
          <select
            value={selectedDay ?? ''}
            onChange={(e) => {
              const val = e.target.value
              setSelectedDay(val ? (val as Day) : null)
              setSelectedSlot(null)
            }}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t.dayPlaceholder[lang]}</option>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {DAY_LABELS[day][lang]}
              </option>
            ))}
          </select>
        </div>

        {/* Slot grid */}
        {selectedDay && !selectedSlot && (
          <>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {t.selectSlot[lang]}
            </p>
            <SlotGrid
              day={selectedDay}
              onSelect={(room, slot) => setSelectedSlot({ room, slot })}
            />
          </>
        )}

        {/* Check existing reservation — hidden while form is open */}
        {!selectedSlot && <CheckReservation />}

        {/* Booking form */}
        {selectedDay && selectedSlot && (
          <BookingForm
            day={selectedDay}
            room={selectedSlot.room}
            slot={selectedSlot.slot}
            onBack={() => setSelectedSlot(null)}
            onSuccess={() => { setSelectedSlot(null); setSelectedDay(null) }}
          />
        )}

      </div>
    </main>
  )
}
