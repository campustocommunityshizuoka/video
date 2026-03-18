import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Stripe from 'stripe'

export const runtime = 'edge';

type Video = { id: string; title: string; vimeo_id: string; thumbnail_url: string | null }

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ★追加：管理者かどうかを判定
  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  const { data: subscription } = await supabase
    .from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()

  const { data: videos } = await supabase.from('videos').select('*')
  
  const { data: history } = await supabase
    .from('viewing_history').select('vimeo_video_id').eq('user_id', user.id)
  
  const viewedIds = new Set(history?.map(h => h.vimeo_video_id) || [])

  const { data: latestHistory } = await supabase
    .from('viewing_history').select('vimeo_video_id').eq('user_id', user.id)
    .order('viewed_at', { ascending: false }).limit(1).maybeSingle()

  let lastWatchedVideo: Video | null = null
  if (latestHistory && videos) {
    lastWatchedVideo = videos.find(v => v.vimeo_id === latestHistory.vimeo_video_id) as Video || null
  }

  const { data: favoritesData } = await supabase
    .from('favorites').select('vimeo_video_id').eq('user_id', user.id).order('created_at', { ascending: false })

  const favoriteIds = new Set(favoritesData?.map(f => f.vimeo_video_id) || [])
  const favoriteVideos = videos?.filter(v => favoriteIds.has(v.vimeo_id)) as Video[] || []

  const groupedVideos: Record<string, Video[]> = {}
  if (videos) {
    videos.forEach((video) => {
      const match = video.title.match(/^(\d+)-/)
      const section = match ? match[1] : 'その他'
      if (!groupedVideos[section]) groupedVideos[section] = []
      groupedVideos[section].push(video as Video)
    })
  }

  const sortedSections = Object.keys(groupedVideos).sort((a, b) => {
    if (a === 'その他') return 1; if (b === 'その他') return -1;
    return parseInt(a) - parseInt(b);
  })

  const sectionStats = sortedSections.map(section => {
    const totalCount = groupedVideos[section].length
    const viewedCount = groupedVideos[section].filter(v => viewedIds.has(v.vimeo_id)).length
    const progress = totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0
    return { section, totalCount, viewedCount, progress }
  })

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'light': return 'ライトプラン（月10本）'
      case 'standard': return 'スタンダードプラン（月30本）'
      case 'premium': return 'プレミアムプラン（無制限）'
      default: return '未契約'
    }
  }

  const signOut = async () => {
    'use server'
    const supabaseClient = await createClient()
    await supabaseClient.auth.signOut()
    redirect('/login')
  }

  const goToBillingPortal = async () => {
    'use server'
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2026-02-25.clover' })
    if (!subscription) return
    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
    const customerId = stripeSub.customer as string
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: 'http://localhost:3000/dashboard' })
    if (session.url) redirect(session.url)
  }

  const VideoCard = ({ video, label }: { video: Video, label?: string }) => {
    const isViewed = viewedIds.has(video.vimeo_id)
    return (
      <Link href={`/video/${video.vimeo_id}`} className="block group">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:border-blue-300 flex items-center p-3 gap-4 relative">
          <div className="w-32 aspect-video bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center">
            {video.thumbnail_url ? (
               <img src={video.thumbnail_url} alt={video.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
            ) : (
               <span className="text-gray-400 text-xs font-medium">Video</span>
            )}
            {isViewed && (
              <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm font-bold">✓ 済</div>
            )}
          </div>
          <div className="flex-grow">
            {label && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1 inline-block">{label}</span>}
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{video.title}</h3>
          </div>
          <div className="pr-4 hidden sm:block">
            <span className="text-blue-600 font-medium text-sm">▶ 視聴</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">学習ダッシュボード</h1>
          
          <div className="flex items-center gap-4">
            {/* ★追加：管理者のみ表示される管理画面へのリンク */}
            {isAdmin && (
              <Link href="/admin" className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors shadow-sm hidden sm:block">
                管理画面へ
              </Link>
            )}
            <form action={signOut}>
              <button className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">ログアウト</button>
            </form>
          </div>
        </div>
        
        {/* ご契約状況 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <p className="mb-4 text-gray-600">ようこそ、<span className="font-semibold text-gray-800">{user.email}</span> さん</p>
          <div className="bg-gradient-to-r from-blue-50 border-l-4 border-blue-500 rounded-r-md p-6">
            <h2 className="text-sm font-bold text-blue-800 mb-2 tracking-wider">現在のご契約状況</h2>
            {subscription ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-extrabold text-blue-900 mb-1">{getPlanName(subscription.plan_type)}</p>
                  <p className="text-sm text-blue-700">更新日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}</p>
                </div>
                <form action={goToBillingPortal}>
                  <button type="submit" className="text-sm bg-white border border-blue-200 text-blue-700 px-5 py-2.5 rounded-md hover:bg-blue-50 font-medium shadow-sm">
                    契約内容の確認・変更
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-blue-800 font-medium">プラン未契約です。</p>
                <Link href="/pricing" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-center">プランを選択する</Link>
              </div>
            )}
          </div>
        </div>

        {/* クイックアクセス */}
        {(lastWatchedVideo || favoriteVideos.length > 0) && (
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {lastWatchedVideo && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">▶</span> 続きから見る
                </h2>
                <VideoCard video={lastWatchedVideo} label="最近視聴" />
              </div>
            )}
            {favoriteVideos.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-pink-500">♥</span> お気に入り
                </h2>
                <div className="space-y-3">
                  {favoriteVideos.slice(0, 3).map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* コース一覧（セクション一覧） */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">学習コース一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionStats.map(({ section, totalCount, viewedCount, progress }) => (
            <Link href={`/section/${section}`} key={section} className="block group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-blue-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">セクション {section}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{totalCount} 本</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>進捗: {progress}%</span>
                  <span>{viewedCount} / {totalCount} 完了</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}