import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// サポートする言語とデフォルトの言語を設定
const locales = ['ja', 'en']
const defaultLocale = 'ja' // 日本語をベースとして設定

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // URLのパスにすでにロケール（/ja/ や /en/）が含まれているか確認
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return // すでに含まれていればそのまま通す

  // ロケールが含まれていない場合は、デフォルト言語（/ja）を付与してリダイレクト
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // apiフォルダや画像ファイル、Next.jsの内部ファイル等をリダイレクト対象から外す
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}