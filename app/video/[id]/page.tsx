import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from './VideoPlayer' // 作成したクライアントコンポーネントを読み込みます
import FavoriteButton from '././FavoriteButton' // ★お気に入りボタンを読み込みます

export const runtime = 'edge';

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id: videoId } = await params

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
        <Link href="/pricing" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">プラン選択画面へ</Link>
      </div>
    )
  }

  const planLimits: Record<string, number> = {
    light: 10,
    standard: 30,
    premium: 9999999,
  }
  const limit = planLimits[subscription.plan_type] || 0

  const { count } = await supabase
    .from('viewing_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('viewed_at', subscription.current_period_start)
    .lte('viewed_at', subscription.current_period_end)

  const currentCount = count || 0

  const { data: alreadyViewed } = await supabase
    .from('viewing_history')
    .select('id')
    .eq('user_id', user.id)
    .eq('vimeo_video_id', videoId)
    .gte('viewed_at', subscription.current_period_start)
    .maybeSingle()

  // 未視聴、かつ上限に達している場合は再生画面をブロックします
  if (!alreadyViewed && currentCount >= limit) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-red-600 mb-4">今月の視聴上限（{limit}本）に達しました</p>
        <p className="text-gray-600 mb-6">新しい動画を視聴するには、来月の更新をお待ちいただくか、プランの変更をご検討ください。</p>
        <Link href="/dashboard" className="text-blue-600 underline hover:text-blue-800">ダッシュボードに戻る</Link>
      </div>
    )
  }

  // ★追加：この動画がすでにお気に入り登録されているかデータベースを確認します
  const { data: favorite } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('vimeo_video_id', videoId)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ヘッダー部分にお気に入りボタンを配置します */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">授業動画再生</h1>
            <FavoriteButton videoId={videoId} initialIsFavorited={!!favorite} />
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline border border-blue-200 px-3 py-1.5 rounded-md bg-white text-center">← ダッシュボードに戻る</Link>
        </div>
        
        {/* 動画プレイヤーを配置します */}
        <VideoPlayer videoId={videoId} alreadyViewed={!!alreadyViewed} />

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">現在のプラン</p>
            <p className="text-lg font-semibold text-blue-900 capitalize">{subscription.plan_type} プラン</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">今月の視聴本数</p>
            <p className="text-lg font-semibold text-gray-800">
              {currentCount} <span className="text-sm font-normal text-gray-500">/ {subscription.plan_type === 'premium' ? '無制限' : `${limit} 本`}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}