import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import PasswordInput from '@/app/components/PasswordInput'

export const runtime = 'edge';

export default async function SignupPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ lang: 'ja' | 'en' }>,
  searchParams: Promise<{ message?: string }>
}) {
  const { lang } = await params;
  const { message } = await searchParams;
  const dict = await getDictionary(lang);

  const signUp = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const currentLang = formData.get('lang') as string
    
    // ★追加：現在のサイトURL（origin）を取得します
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const supabase = await createClient()

    // ★修正：signUp処理に options と emailRedirectTo を追加します
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/callback?next=/${currentLang}/dashboard`,
      }
    })

    if (error) {
      return redirect(`/${currentLang}/signup?message=error`)
    }
    return redirect(`/${currentLang}/login?message=success`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher currentLang={lang} />
      </div>
      
      <form action={signUp} className="flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md gap-4">
        <input type="hidden" name="lang" value={lang} />
        
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">{dict.auth.signupTitle}</h1>
        
        {message === 'error' && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center mb-2">
            {dict.auth.signupError}
          </div>
        )}
        
        <label className="text-sm font-medium text-gray-700" htmlFor="email">{dict.auth.emailLabel}</label>
        <input
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
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
        
        <div className="flex flex-col gap-2 mt-6">
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium">
            {dict.auth.signupButton}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
          {dict.auth.toLoginText}{' '}
          <Link href={`/${lang}/login`} className="text-blue-600 hover:underline font-medium">
            {dict.auth.toLoginLink}
          </Link>
        </div>
      </form>
    </div>
  )
}