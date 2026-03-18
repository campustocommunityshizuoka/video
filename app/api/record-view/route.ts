import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { videoId } = await req.json()

    // すでに今月の視聴履歴に存在するかチェック
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) return NextResponse.json({ error: 'No active plan' }, { status: 403 })

    const { data: alreadyViewed } = await supabase
      .from('viewing_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('vimeo_video_id', videoId)
      .gte('viewed_at', subscription.current_period_start)
      .single()

    // まだ視聴履歴になければ記録を追加
    if (!alreadyViewed) {
      await supabase.from('viewing_history').insert({
        user_id: user.id,
        vimeo_video_id: videoId
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}