import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.session) {
      const user = data.session.user;

      const newSessionId = crypto.randomUUID();
      await supabase
        .from('subscriptions')
        .update({ current_session_id: newSessionId })
        .eq('user_id', user.id);
        
      console.log(`【セッション更新】: ユーザー ${user.id}`);

      // ★修正：レスポンスを作成しCookieを付与
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.set('device_session_id', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
      return response;
    } else {
      console.error('【認証エラー発生】:', error?.message)
    }
  } else {
    console.error('【認証エラー発生】: URLに認証コード(code)が含まれていません')
  }

  // エラー時はトップページへ戻します
  return NextResponse.redirect(`${origin}/?message=auth-error`)
}