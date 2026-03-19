import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 認証に成功したら、指定されたパスワード更新画面へリダイレクト
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // ★エラーの真の原因をPowerShellに表示します
      console.error('【認証エラー発生】:', error.message)
    }
  } else {
    console.error('【認証エラー発生】: URLに認証コード(code)が含まれていません')
  }

  // エラー時はトップページへ戻します
  return NextResponse.redirect(`${origin}/?message=auth-error`)
}