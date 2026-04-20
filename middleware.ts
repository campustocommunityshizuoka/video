import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. レスポンスオブジェクトの初期化
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Supabaseクライアントの初期化 (Server Component/Middleware用)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // セッション情報を取得
  const { data: { user } } = await supabase.auth.getUser() // サーバー側で認証を検証
  const { data: { session } } = await supabase.auth.getSession() // トークン取得用
  const { pathname } = request.nextUrl

  // ----------------------------------------------------------------
  // A. 1アカウント1ログイン制限ロジック (ダッシュボードと動画ページが対象)
  // ----------------------------------------------------------------
  if (session && (pathname.includes('/dashboard') || pathname.includes('/video'))) {
    // データベースから最新のセッションIDを取得
    const { data: sub } = await supabase
      .from('subscriptions')
      .select(' current_session_id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    // ライト・スタンダードプランのみ判定
    if (sub) {
      // ★修正：アクセストークンではなく、端末にセットしたCookieのIDを確認
      const currentTokenId = request.cookies.get('device_session_id')?.value;
      
      // DBのIDとCookieのIDが一致しない＝別の端末で新しくログインされた
      if (sub.current_session_id && sub.current_session_id !== currentTokenId) {
        // 強制ログアウト処理
        await supabase.auth.signOut();
        response.cookies.delete('device_session_id'); // Cookieのお掃除
        const lang = pathname.startsWith('/en') ? 'en' : 'ja';
        const redirectUrl = new URL(`/${lang}/login?message=other_device`, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // ----------------------------------------------------------------
  // B. 言語リダイレクトロジック (既存機能)
  // ----------------------------------------------------------------
  const locales = ['ja', 'en']
  const defaultLocale = 'ja'
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // ロケールが含まれていない場合は、デフォルト言語（/ja）を付与
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}