import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const password = formData.get('password') as string
  const currentLang = formData.get('lang') as string || 'ja'

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('パスワード更新エラー:', error.message)
      return NextResponse.redirect(new URL(`/${currentLang}/update-password?message=error`, request.url), 303)
    }
    
    return NextResponse.redirect(new URL(`/${currentLang}/dashboard?message=password_updated`, request.url), 303)
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/${currentLang}/update-password?message=error`, request.url), 303)
  }
}