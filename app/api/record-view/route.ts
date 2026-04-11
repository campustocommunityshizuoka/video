import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { videoId } = await req.json()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) return NextResponse.json({ error: 'No active plan' }, { status: 403 })

    // ★ 修正：今月ではなく「今期の契約期間（1年間）」ですでに見たかチェック
    const { data: alreadyViewed } = await supabase
      .from('viewing_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('vimeo_video_id', videoId)
      .gte('viewed_at', subscription.current_period_start) // 契約開始日（1年前）から
      .lte('viewed_at', subscription.current_period_end)   // 契約終了日まで
      .maybeSingle()

    // すでにこの期間内に視聴済みなら、重複して記録しない
    if (alreadyViewed)
      return NextResponse.json({ success: true })

    // 今期の総視聴本数をカウント（年間）
    const { count } = await supabase
      .from('viewing_history').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('viewed_at', subscription.current_period_start)
      .lte('viewed_at', subscription.current_period_end)

    const currentCount = count || 0
    // 年契約に合わせた制限（例：ライトなら年120本など。必要に応じて数値を調整してください）
    const planLimits: Record<string, number> = { light: 10, standard: 30, premium: 1000 }
    const limit = planLimits[subscription.plan_type] || 0

    if (currentCount >= limit) {
      // チケット（買い足し枠）のチェックロジックはそのまま維持
      const { data: credit } = await supabase
        .from('video_credits')
        .select('*')
        .eq('user_id', user.id)
        .gt('remaining', 0)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (credit) {
        await supabase
          .from('video_credits')
          .update({ remaining: credit.remaining - 1 })
          .eq('id', credit.id);
      } else {
        return NextResponse.json({ error: 'Yearly limit reached' }, { status: 403 })
      }
    }

    // 新しく視聴履歴を挿入
    await supabase.from('viewing_history').insert({
      user_id: user.id,
      vimeo_video_id: videoId
    });

    return NextResponse.json({ success: true })

    } catch (error) {
    // ★ ここで try を閉じ、catch ブロックを配置します
    console.error('Record View Error:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}