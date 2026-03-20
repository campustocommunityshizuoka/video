import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ lang: 'ja' | 'en' }>,
  searchParams: Promise<{ message?: string }>
}) {
  const { lang } = await params;
  const { message } = await searchParams;
  const dict = await getDictionary(lang);



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher currentLang={lang} />
      </div>

      <form action="/api/auth/reset-password" method="POST" className="flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md gap-4">
        <input type="hidden" name="lang" value={lang} />
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">{dict.auth.resetPasswordTitle}</h1>
        <p className="text-sm text-gray-600 text-center mb-4">{dict.auth.resetPasswordDesc}</p>
        
        {/* 成功メッセージ */}
        {message === 'success' && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm text-center mb-2 font-medium border border-green-200">
            {dict.auth.resetLinkSent}
          </div>
        )}
        
        {/* ★追加：上限到達時のメッセージ（目立つようにオレンジ色にします） */}
        {message === 'rate_limit' && (
          <div className="bg-orange-50 text-orange-700 p-4 rounded-md text-sm text-center mb-2 font-medium border border-orange-200">
            {dict.auth.rateLimitError}
          </div>
        )}

        {/* 汎用エラーメッセージ */}
        {message === 'error' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm text-center mb-2 font-medium border border-red-200">
            {dict.auth.generalError}
          </div>
        )}
        
        <label className="text-sm font-medium text-gray-700" htmlFor="email">{dict.auth.emailLabel}</label>
        <input
          id="email"    // ← 追加（ラベルの htmlFor="email" と紐付けるため）
          name="email"  // ← 追加（一番重要：APIへデータを送るため）
          type="email"  // ← 追加（スマホ等のキーボード入力を最適化するため）
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white w-full"
          placeholder={dict.auth.emailPlaceholder}
          required
        />
        
        <div className="flex flex-col gap-2 mt-4">
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium">
            {dict.auth.sendResetLink}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
          <Link href={`/${lang}/login`} className="text-blue-600 hover:underline font-medium">
            {dict.auth.backToLogin}
          </Link>
        </div>
      </form>
    </div>
  )
}