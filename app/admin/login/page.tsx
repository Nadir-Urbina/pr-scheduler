'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { useLang } from '@/lib/context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LangToggle from '@/components/LangToggle'

const t = {
  title: { es: 'Acceso Admin', en: 'Admin Login' },
  subtitle: { es: 'La Cresta Scheduler', en: 'La Cresta Scheduler' },
  email: { es: 'Correo electrónico', en: 'Email' },
  password: { es: 'Contraseña', en: 'Password' },
  submit: { es: 'Iniciar sesión', en: 'Sign in' },
  submitting: { es: 'Iniciando sesión...', en: 'Signing in...' },
  noAccount: { es: '¿Necesitas una cuenta?', en: 'Need an account?' },
  register: { es: 'Regístrate', en: 'Register' },
  errInvalid: { es: 'Correo o contraseña incorrectos.', en: 'Invalid email or password.' },
  errGeneric: { es: 'Ocurrió un error. Intenta de nuevo.', en: 'Something went wrong. Please try again.' },
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.push('/admin')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError(t.errInvalid[lang])
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t.password[lang]}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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

        <p className="text-sm text-gray-400 text-center mt-6">
          {t.noAccount[lang]}{' '}
          <Link href="/admin/register" className="text-gray-600 underline">
            {t.register[lang]}
          </Link>
        </p>
      </div>
    </main>
  )
}
