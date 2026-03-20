import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import PasswordInput from '@/app/components/PasswordInput'
import { signInAction } from '@/app/actions/auth'


export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function LoginPage({ 
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

      <form action={signInAction} className="flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md gap-4">
      
        <input type="hidden" name="lang" value={lang} />
        
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">{dict.auth.loginTitle}</h1>
        
        {message === 'error' && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center mb-2">
            {dict.auth.loginError}
          </div>
        )}
        {message === 'success' && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm text-center mb-2">
            {dict.auth.signupSuccess}
          </div>
        )}
        
        <label className="text-sm font-medium text-gray-700" htmlFor="email">{dict.auth.emailLabel}</label>
        <input
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white w-full"
          name="email"
          type="email"
          placeholder={dict.auth.emailPlaceholder}
          required
        />
        
        <label className="text-sm font-medium text-gray-700 mt-2" htmlFor="password">{dict.auth.passwordLabel}</label>
        <PasswordInput 
          name="password"
          placeholder={dict.auth.passwordPlaceholder}
          required={true}
          minLength={6}
          showText={dict.auth.showPassword}
          hideText={dict.auth.hidePassword}
        />
        
        {/* ★追加：パスワードリセットへの導線 */}
        <div className="flex justify-end mt-1">
          <Link href={`/${lang}/reset-password`} className="text-xs text-blue-600 hover:underline font-medium">
            {dict.auth.forgotPassword}
          </Link>
        </div>
        
        <div className="flex flex-col gap-2 mt-6">
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium">
            {dict.auth.loginButton}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
          {dict.auth.toSignupText}{' '}
          <Link href={`/${lang}/signup`} className="text-blue-600 hover:underline font-medium">
            {dict.auth.toSignupLink}
          </Link>
        </div>
      </form>
    </div>
  )
}