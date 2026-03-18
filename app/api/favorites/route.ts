import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { videoId } = await req.json()

    // 既にお気に入り登録されているか確認
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('vimeo_video_id', videoId)
      .maybeSingle()

    if (existing) {
      // 登録済みの場合は削除（お気に入り解除）
      await supabase.from('favorites').delete().eq('id', existing.id)
      return NextResponse.json({ favorited: false })
    } else {
      // 未登録の場合は追加
      await supabase.from('favorites').insert({ user_id: user.id, vimeo_video_id: videoId })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}