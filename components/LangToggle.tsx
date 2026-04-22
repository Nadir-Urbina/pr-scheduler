'use client'

import { useLang } from '@/lib/context/LanguageContext'

export default function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
      className={`text-sm font-medium text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors ${className ?? ''}`}
    >
      {lang === 'es' ? 'English' : 'Español'}
    </button>
  )
}
