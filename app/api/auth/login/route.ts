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
  let newSessionId = ''

  try {
    const supabase = await createClient()
    const { data , error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('ログインエラー:', error.message)
      redirectUrl = `/${currentLang}/login?message=error`
    } else if (data.session) {
      // ★ ここから追加：セッションIDをDBに記録
      newSessionId = crypto.randomUUID()
      
      const user = data.session.user

      await supabase
        .from('subscriptions')
        .update({ current_session_id: newSessionId })
        .eq('user_id', user.id)
      
      redirectUrl = `/${currentLang}/dashboard`
    }
  } catch (e: any) {
    console.error('予期せぬシステムエラー:', e.message)
    redirectUrl = `/ja/login?message=error`
  }

  const response = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
  if (newSessionId) {
    response.cookies.set('device_session_id', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1年保持
      path: '/',
    })
  }
  return response
}