import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const currentLang = formData.get('lang') as string || 'ja'

  const supabaseClient = await createClient()
  await supabaseClient.auth.signOut()

  return NextResponse.redirect(new URL(`/${currentLang}/login`, request.url), 303)
}