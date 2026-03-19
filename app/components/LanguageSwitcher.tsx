'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  // 現在のURLパスを取得します（例: /ja/dashboard）
  const pathname = usePathname()

  // 選択された言語のURLを生成する関数です
  const getTargetUrl = (targetLang: string) => {
    if (!pathname) return `/${targetLang}`
    // 現在の言語部分（/ja または /en）を、新しい言語に置換します
    return pathname.replace(`/${currentLang}`, `/${targetLang}`)
  }

  return (
    <div className="flex items-center gap-3 mr-6 border-r border-gray-200 pr-6">
      <Link
        href={getTargetUrl('ja')}
        className={`text-sm font-medium transition-colors ${
          currentLang === 'ja' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        JP
      </Link>
      <span className="text-gray-300 text-xs">|</span>
      <Link
        href={getTargetUrl('en')}
        className={`text-sm font-medium transition-colors ${
          currentLang === 'en' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        EN
      </Link>
    </div>
  )
}