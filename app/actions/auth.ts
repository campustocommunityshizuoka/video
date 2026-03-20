// app/actions/auth.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// 1. ログイン処理
export async function signInAction(formData: FormData) {
  let redirectUrl = ''
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const currentLang = formData.get('lang') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

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
  if (redirectUrl) redirect(redirectUrl)
}

// 2. 新規登録処理
export async function signUpAction(formData: FormData) {
  let redirectUrl = ''
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const currentLang = formData.get('lang') as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl}/api/auth/callback?next=/${currentLang}/dashboard` }
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
  if (redirectUrl) redirect(redirectUrl)
}

// 3. パスワードリセット要求処理
export async function requestResetAction(formData: FormData) {
  const email = formData.get('email') as string
  const currentLang = formData.get('lang') as string
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/${currentLang}/update-password`,
  })

  if (error) {
    console.error('メール送信エラー:', error.message)
    if (error.message.toLowerCase().includes('rate limit')) {
      redirect(`/${currentLang}/reset-password?message=rate_limit`)
    }
    redirect(`/${currentLang}/reset-password?message=error`)
  }
  redirect(`/${currentLang}/reset-password?message=success`)
}

// 4. パスワード更新処理
export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string
  const currentLang = formData.get('lang') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('パスワード更新エラー:', error.message)
    redirect(`/${currentLang}/update-password?message=error`)
  }
  redirect(`/${currentLang}/dashboard?message=password_updated`)
}

// 5. ログアウト処理（ダッシュボード等で使用）
export async function signOutAction(formData: FormData) {
  const currentLang = formData.get('lang') as string
  const supabaseClient = await createClient()
  await supabaseClient.auth.signOut()
  redirect(`/${currentLang}/login`)
}