import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const title = formData.get('title') as string
  const vimeo_id = formData.get('vimeo_id') as string
  const lang = formData.get('lang') as string || 'ja'

  if (!title || !vimeo_id) {
    return NextResponse.redirect(new URL(`/${lang}/admin`, request.url), 303)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // API側でも管理者権限を厳格にチェックします
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url), 303)
  }

  await supabase.from('videos').insert({ title, vimeo_id })

  return NextResponse.redirect(new URL(`/${lang}/admin`, request.url), 303)
}