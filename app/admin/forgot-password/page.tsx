'use client'

import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { useLang } from '@/lib/context/LanguageContext'
import Link from 'next/link'
import LangToggle from '@/components/LangToggle'

const t = {
  title: { es: 'Restablecer Contraseña', en: 'Reset Password' },
  subtitle: { es: 'La Cresta Scheduler', en: 'La Cresta Scheduler' },
  intro: {
    es: 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.',
    en: "Enter your email and we'll send you a link to reset your password.",
  },
  email: { es: 'Correo electrónico', en: 'Email' },
  submit: { es: 'Enviar enlace', en: 'Send link' },
  submitting: { es: 'Enviando...', en: 'Sending...' },
  backToLogin: { es: 'Volver a iniciar sesión', en: 'Back to sign in' },
  // Always shown on success, even if the email doesn't exist, to avoid leaking which accounts are registered.
  sent: {
    es: 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.',
    en: 'If an account exists for that email, you will receive a reset link. Check your spam folder too.',
  },
  errInvalidEmail: { es: 'Correo electrónico inválido.', en: 'Invalid email address.' },
  errGeneric: { es: 'Ocurrió un error. Intenta de nuevo.', en: 'Something went wrong. Please try again.' },
}

export default function AdminForgotPasswordPage() {
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email.trim())
      setSent(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/invalid-email') {
        setError(t.errInvalidEmail[lang])
      } else if (code === 'auth/user-not-found') {
        // Don't reveal whether the account exists — show the same success message.
        setSent(true)
      } else {
        setError(t.errGeneric[lang])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title[lang]}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle[lang]}</p>
          </div>
          <LangToggle className="shrink-0 ml-4" />
        </div>

        {sent ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            {t.sent[lang]}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">{t.intro[lang]}</p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t.email[lang]}
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-semibold rounded-xl px-4 py-3 text-base hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? t.submitting[lang] : t.submit[lang]}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-400 text-center mt-6">
          <Link href="/admin/login" className="text-gray-600 underline">
            {t.backToLogin[lang]}
          </Link>
        </p>
      </div>
    </main>
  )
}
