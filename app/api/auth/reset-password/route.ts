import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const currentLang = formData.get('lang') as string || 'ja'
  
  // リクエストのURLからオリジン（ドメイン部分）を取得します
  const origin = new URL(request.url).origin

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/api/auth/callback?next=/${currentLang}/update-password`,
    })

    if (error) {
      console.error('メール送信エラー:', error.message)
      if (error.message.toLowerCase().includes('rate limit')) {
        return NextResponse.redirect(new URL(`/${currentLang}/reset-password?message=rate_limit`, request.url), 303)
      }
      return NextResponse.redirect(new URL(`/${currentLang}/reset-password?message=error`, request.url), 303)
    }
    return NextResponse.redirect(new URL(`/${currentLang}/reset-password?message=success`, request.url), 303)
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/${currentLang}/reset-password?message=error`, request.url), 303)
  }
}