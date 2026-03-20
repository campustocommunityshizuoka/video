import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import PasswordInput from '@/app/components/PasswordInput'
import { updatePasswordAction } from '@/app/actions/auth'


export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function UpdatePasswordPage({ 
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

      <form action={updatePasswordAction} className="flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md gap-4">
        <input type="hidden" name="lang" value={lang} />
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">{dict.auth.updatePasswordTitle}</h1>
        
        {message === 'error' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm text-center mb-2 font-medium border border-red-200">
            {dict.auth.generalError}
          </div>
        )}
        
        <label className="text-sm font-medium text-gray-700 mt-2" htmlFor="password">{dict.auth.newPasswordLabel}</label>
        <PasswordInput 
          name="password"
          placeholder={dict.auth.passwordPlaceholder}
          required={true}
          minLength={6}
          showText={dict.auth.showPassword}
          hideText={dict.auth.hidePassword}
        />
        
        <div className="flex flex-col gap-2 mt-6">
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium">
            {dict.auth.updatePasswordButton}
          </button>
        </div>
      </form>
    </div>
  )
}