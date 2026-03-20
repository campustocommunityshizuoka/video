// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  // 標準的なフォームデータを受け取ります
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const currentLang = formData.get('lang') as string || 'ja'
  
  let redirectUrl = ''

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('ログインエラー:', error.message)
      redirectUrl = `/${currentLang}/login?message=error`
    } else {
      redirectUrl = `/${currentLang}/dashboard`
    }
  } catch (e: any) {
    console.error('予期せぬシステムエラー:', e.message)
    redirectUrl = `/ja/login?message=error`
  }

  // 303 (See Other) を使って、POSTリクエストから安全にリダイレクトさせます
  return NextResponse.redirect(new URL(redirectUrl, request.url), 303)
}