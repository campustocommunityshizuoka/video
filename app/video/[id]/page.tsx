import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 未ログインの場合はログイン画面へ
  if (!user) {
    redirect('/login')
  }

  // URLから動画IDを取得 (Next.js 15以降の仕様に合わせたPromise解決)
  const { id: videoId } = await params

  // 現在アクティブな契約を取得
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-lg text-gray-800 mb-4">動画を視聴するにはプランの契約が必要です。</p>
        <a href="/pricing" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">プラン選択画面へ</a>
      </div>
    )
  }

  // プランごとの上限回数を設定
  const planLimits: Record<string, number> = {
    light: 10,
    standard: 30,
    premium: 9999999, // 実質無制限
  }
  const limit = planLimits[subscription.plan_type] || 0

  // 今月の課金期間内に視聴した履歴の「件数」を取得
  const { count } = await supabase
    .from('viewing_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('viewed_at', subscription.current_period_start)
    .lte('viewed_at', subscription.current_period_end)

  const currentCount = count || 0

  // ページをリロードするたびにカウントが増えるのを防ぐため、今月すでにこの動画を見ているかチェック
  const { data: alreadyViewed } = await supabase
    .from('viewing_history')
    .select('id')
    .eq('user_id', user.id)
    .eq('vimeo_video_id', videoId)
    .gte('viewed_at', subscription.current_period_start)
    .single()

  // 今月まだ見ていない動画で、かつ上限に達している場合はブロック
  if (!alreadyViewed && currentCount >= limit) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-red-600 mb-4">今月の視聴上限（{limit}本）に達しました</p>
        <p className="text-gray-600 mb-6">新しい動画を視聴するには、来月の更新をお待ちいただくか、プランの変更をご検討ください。</p>
        <a href="/dashboard" className="text-blue-600 underline hover:text-blue-800">マイページに戻る</a>
      </div>
    )
  }

  // 今月初めて見る動画であれば、視聴履歴に記録を追加
  if (!alreadyViewed) {
    await supabase.from('viewing_history').insert({
      user_id: user.id,
      vimeo_video_id: videoId
    })
  }

  // 最新の視聴本数を計算（表示用）
  const displayCount = alreadyViewed ? currentCount : currentCount + 1

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">授業動画再生</h1>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← マイページに戻る</a>
        </div>
        
        {/* Vimeoプレーヤーの埋め込み */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6 relative">
          <iframe 
            src={`https://player.vimeo.com/video/${videoId}`} 
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        {/* 視聴状況の表示 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">現在のプラン</p>
            <p className="text-lg font-semibold text-blue-900 capitalize">{subscription.plan_type} プラン</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">今月の視聴本数</p>
            <p className="text-lg font-semibold text-gray-800">
              {displayCount} <span className="text-sm font-normal text-gray-500">/ {subscription.plan_type === 'premium' ? '無制限' : `${limit} 本`}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}