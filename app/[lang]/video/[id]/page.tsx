import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from './VideoPlayer'
import FavoriteButton from './FavoriteButton'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

export const runtime = 'edge';

export default async function VideoPage({ 
  params 
}: { 
  params: Promise<{ lang: 'ja' | 'en', id: string }> 
}) {
  const { lang, id: videoId } = await params
  const dict = await getDictionary(lang)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: subscription } = await supabase
    .from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single()

  if (!subscription) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center relative">
        <div className="absolute top-6 right-6"><LanguageSwitcher currentLang={lang} /></div>
        <p className="text-lg text-gray-800 mb-4">{dict.video.requireSubscription}</p>
        <Link href={`/${lang}/pricing`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          {dict.video.toPricing}
        </Link>
      </div>
    )
  }

  const planLimits: Record<string, number> = { light: 10, standard: 30, premium: 9999999 }
  const limit = planLimits[subscription.plan_type] || 0

  const { count } = await supabase
    .from('viewing_history').select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('viewed_at', subscription.current_period_start)
    .lte('viewed_at', subscription.current_period_end)

  const currentCount = count || 0

  const { data: alreadyViewed } = await supabase
    .from('viewing_history').select('id').eq('user_id', user.id).eq('vimeo_video_id', videoId)
    .gte('viewed_at', subscription.current_period_start).maybeSingle()

  if (!alreadyViewed && currentCount >= limit) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center relative">
        <div className="absolute top-6 right-6"><LanguageSwitcher currentLang={lang} /></div>
        <p className="text-2xl font-bold text-red-600 mb-4">
          {dict.video.limitReachedTitle.replace('{limit}', limit.toString())}
        </p>
        <p className="text-gray-600 mb-6">{dict.video.limitMessage}</p>
        <Link href={`/${lang}/dashboard`} className="text-blue-600 underline hover:text-blue-800">
          {dict.video.backToDashboard}
        </Link>
      </div>
    )
  }

  const { data: favorite } = await supabase
    .from('favorites').select('id').eq('user_id', user.id).eq('vimeo_video_id', videoId).maybeSingle()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mt-8 md:mt-0">
        
        {/* ヘッダー部分 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">{dict.video.playerTitle}</h1>
            <FavoriteButton 
              videoId={videoId} 
              initialIsFavorited={!!favorite} 
              textAdd={dict.video.favoriteAdd}
              textRemove={dict.video.favoriteRemove}
            />
          </div>
          <div className="flex items-center">
            {/* 言語切り替えボタンと戻るボタンを横並びに配置 */}
            <LanguageSwitcher currentLang={lang} />
            <Link href={`/${lang}/dashboard`} className="text-sm text-blue-600 hover:underline border border-blue-200 px-3 py-1.5 rounded-md bg-white text-center">
              {dict.video.backToDashboard}
            </Link>
          </div>
        </div>
        
        <VideoPlayer 
          videoId={videoId} 
          alreadyViewed={!!alreadyViewed} 
          textCompleted={dict.video.watchCompleted}
        />

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">{dict.video.currentPlan}</p>
            <p className="text-lg font-semibold text-blue-900 capitalize">{subscription.plan_type}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">{dict.video.monthlyWatchCount}</p>
            <p className="text-lg font-semibold text-gray-800">
              {currentCount} <span className="text-sm font-normal text-gray-500">/ {subscription.plan_type === 'premium' ? dict.video.unlimited : `${limit}${dict.video.videosUnit}`}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}