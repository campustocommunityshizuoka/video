import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const currentLang = formData.get('lang') as string || 'ja'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let redirectUrl = ''

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/callback?next=/${currentLang}/dashboard`,
      }
    })

    if (error) {
      console.error('新規登録エラー:', error.message)
      redirectUrl = `/${currentLang}/signup?message=error`
    } else {
      redirectUrl = `/${currentLang}/login?message=success`
    }
  } catch (e: any) {
    console.error('予期せぬシステムエラー:', e.message)
    redirectUrl = `/ja/signup?message=error`
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url), 303)
}