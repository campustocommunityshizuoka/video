import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const id = formData.get('id') as string
  const lang = formData.get('lang') as string || 'ja'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // こちらも管理者権限をチェックします
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url), 303)
  }

  if (id) {
    await supabase.from('videos').delete().eq('id', id)
  }

  return NextResponse.redirect(new URL(`/${lang}/admin`, request.url), 303)
}