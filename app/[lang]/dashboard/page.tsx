import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Stripe from 'stripe'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Video = { id: string; title: string; vimeo_id: string; thumbnail_url: string | null }

export default async function DashboardPage({ params }: { params: Promise<{ lang: 'ja' | 'en' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  const { data: subscription } = await supabase
    .from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()

    const { data: credits } = await supabase
      .from('video_credits')
      .select('remaining')
      .eq('user_id', user.id)
      .gt('remaining', 0)
      .gt('expires_at', new Date().toISOString());

    // すべての有効なレコードの remaining を合計します
    const totalTickets = credits?.reduce((acc, curr) => acc + curr.remaining, 0) || 0;

  // 3. 今期の視聴済み本数を取得 (サブスク期間内)
    let watchedCount = 0;
    if (subscription) {
      const { count } = await supabase
        .from('viewing_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('viewed_at', subscription.current_period_start)
        .lte('viewed_at', subscription.current_period_end);
      watchedCount = count || 0;
    }

    // 4. 合計キャパシティの計算 (基本枠 + チケット枠)
    const baseLimit = subscription ? 25 : 0;
    const totalCapacity = baseLimit + totalTickets;

    // ビデオデータ等の取得 (既存ロジック)
    const { data: videos } = await supabase.from('videos').select('*')
    const { data: history } = await supabase.from('viewing_history').select('vimeo_video_id').eq('user_id', user.id)
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

  const VideoCard = ({ video, label }: { video: Video, label?: string }) => {
    const isViewed = viewedIds.has(video.vimeo_id)
    return (
      <Link href={`/${lang}/video/${video.vimeo_id}`} className="block group">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:border-blue-300 flex items-center p-3 gap-4 relative">
          <div className="w-32 aspect-video bg-gray-100 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center">
            {video.thumbnail_url ? (
               <img src={video.thumbnail_url} alt={video.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
            ) : (
               <span className="text-gray-400 text-xs font-medium">Video</span>
            )}
            {isViewed && (
              <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm font-bold">✓</div>
            )}
          </div>
          <div className="grow">
            {label && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1 inline-block">{label}</span>}
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{video.title}</h3>
          </div>
          <div className="pr-4 hidden sm:block">
            <span className="text-blue-600 font-medium text-sm">{dict.dashboard.watch}</span>
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
          <h1 className="text-2xl font-bold text-gray-800">{dict.dashboard.title}</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLang={lang} />
            <form action="/api/auth/signout" method="POST">
              <button className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">{dict.dashboard.logoutButton}</button>
            </form>
          </div>
        </div>
        
        {/* ご契約状況 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <p className="mb-4 text-gray-600">
            {dict.dashboard.welcome}<span className="font-semibold text-gray-800">{user.email}</span>{dict.dashboard.honorific}
          </p>
          <div className="bg-linear-to-r from-blue-50 border-l-4 border-blue-500 rounded-r-md p-6">
            <h2 className="text-sm font-bold text-blue-800 mb-2 tracking-wider">{dict.dashboard.subscriptionStatus}</h2>
            {subscription ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-extrabold text-blue-900 mb-1">{dict.dashboard.planStandard}</p>
                  <p className="text-sm text-blue-700">
                    {dict.dashboard.renewalDate}{new Date(subscription.current_period_end).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                  </p>
                </div>

                {/* ★進捗インジケーターボックス */}
                  <div className="bg-white/80 px-5 py-3 rounded-xl border border-blue-100 shadow-sm min-w-50">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Monthly Usage</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-gray-900">{watchedCount}</span>
                      <span className="text-sm font-bold text-gray-400">/ {totalCapacity}</span>
                      <span className="text-xs font-bold text-gray-500 ml-1">本</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-500" 
                          style={{ width: `${Math.min((watchedCount / totalCapacity) * 100, 100)}%` }}
                        ></div>
                      </div>
                  </div>

                {/* 修正後 */}
                <form action="/api/portal" method="POST">
                  <input type="hidden" name="lang" value={lang} />
                   <button type="submit" className="text-sm bg-white border border-blue-200 text-blue-700 px-5 py-2.5 rounded-md hover:bg-blue-50 font-medium shadow-sm">
                     {dict.dashboard.manageSubscription}
                   </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-blue-800 font-medium">{dict.dashboard.noSubscription}</p>
                <Link href={`/${lang}/pricing`} className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-center">
                  {dict.dashboard.choosePlan}
                </Link>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">🎟️</div>
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    {dict.dashboard.validTickets.replace('{count}', totalTickets.toString())}
                  </p>
                  <p className="text-[10px] text-blue-600 font-medium">
                    {dict.dashboard.ticketStockLimit}
                  </p>
                </div>
              </div>
              
              <form action="/api/checkout" method="POST">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_ID_ADDON} />
                <input type="hidden" name="type" value="addon" /> {/* ★追加購入であることを明示 */}
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-extrabold rounded-lg shadow-md transition-all active:scale-95">
                  {dict.dashboard.buyTickets}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* クイックアクセス */}
        {(lastWatchedVideo || favoriteVideos.length > 0) && (
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {lastWatchedVideo && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">▶</span> {dict.dashboard.continueWatching}
                </h2>
                <VideoCard video={lastWatchedVideo} label={dict.dashboard.recentlyWatched} />
              </div>
            )}
            {favoriteVideos.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-pink-500">♥</span> {dict.dashboard.favorites}
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
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">{dict.dashboard.courseList}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionStats.map(({ section, totalCount, viewedCount, progress }) => (
            <Link href={`/${lang}/section/${section}`} key={section} className="block group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-blue-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">{dict.dashboard.section}{section}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{totalCount}{dict.dashboard.videosCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>{dict.dashboard.progress}{progress}%</span>
                  <span>{viewedCount} / {totalCount}{dict.dashboard.completed}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ここから追加: ダッシュボード用のミニフッター */}
      <div className="mt-16 pt-8 pb-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-xs text-gray-500">
          <Link href={`/${lang}/terms`} className="hover:text-blue-600 transition-colors">
            Terms of Service / 利用規約
          </Link>
          <Link href={`/${lang}/privacy`} className="hover:text-blue-600 transition-colors">
            Privacy Policy / プライバシーポリシー
          </Link>
          <Link href={`/${lang}/legal`} className="hover:text-blue-600 transition-colors">
            Legal Notice / 特定商取引法に基づく表記
          </Link>
          <span className="mt-4 md:mt-0 text-gray-400">
            © {new Date().getFullYear()} Nihongo Learning
          </span>
        </div>
      </div>

    </div>
  )
}