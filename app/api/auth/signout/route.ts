import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const currentLang = formData.get('lang') as string || 'ja'

  const supabaseClient = await createClient()
  await supabaseClient.auth.signOut()

  const response = NextResponse.redirect(new URL(`/${currentLang}/login`, request.url), 303)
  
  response.cookies.delete('device_session_id')

  return response
}