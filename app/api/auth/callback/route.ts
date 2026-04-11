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

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (subscription?.plan_type === 'light' || subscription?.plan_type === 'standard') {
        // アクセストークンの末尾など、このセッション固有の値を識別子とする
        const sessionId = data.session.access_token.slice(-20);
        
        await supabase
          .from('subscriptions')
          .update({ current_session_id: sessionId })
          .eq('user_id', user.id);
          
        console.log(`【セッション更新】: ユーザー ${user.id} (${subscription.plan_type})`);
      }

      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('【認証エラー発生】:', error?.message)
    }
  } else {
    console.error('【認証エラー発生】: URLに認証コード(code)が含まれていません')
  }

  // エラー時はトップページへ戻します
  return NextResponse.redirect(`${origin}/?message=auth-error`)
}