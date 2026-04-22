'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { useLang } from '@/lib/context/LanguageContext'
import { useRouter } from 'next/navigation'
import LangToggle from '@/components/LangToggle'

const t = {
  signOut: { es: 'Cerrar sesión', en: 'Sign out' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { lang } = useLang()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/admin/login')
      } else {
        setEmail(user.email)
        setChecking(false)
      }
    })
    return unsub
  }, [router])

  async function handleSignOut() {
    await signOut(auth)
    router.replace('/admin/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold text-gray-900">La Cresta</span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-sm text-gray-500">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">{email}</span>
          <LangToggle />
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {t.signOut[lang]}
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
