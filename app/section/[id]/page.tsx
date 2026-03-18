import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const runtime = 'edge';

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id: sectionId } = await params

  // このセクションに該当する動画のみを取得
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .like('title', `${sectionId}-%`) // タイトルが「X-」から始まるもの

  // 動画番号順に並び替え
  const sortedVideos = videos?.sort((a, b) => {
    const aNum = parseInt(a.title.match(/-(\d+)/)?.[1] || '0')
    const bNum = parseInt(b.title.match(/-(\d+)/)?.[1] || '0')
    return aNum - bNum
  }) || []

  // このユーザーの視聴履歴を取得（視聴済みの「チェックマーク」をつけるため）
  const { data: history } = await supabase
    .from('viewing_history')
    .select('vimeo_video_id')
    .eq('user_id', user.id)
  
  const viewedIds = new Set(history?.map(h => h.vimeo_video_id) || [])

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mb-4 inline-block">← ダッシュボードへ戻る</Link>
          <h1 className="text-2xl font-bold text-gray-800">セクション {sectionId} の動画一覧</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedVideos.map((video) => {
            const isViewed = viewedIds.has(video.vimeo_id)
            return (
              <div key={video.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                  <span className="text-gray-400 font-medium">Video</span>
                  {/* 視聴済みの場合はチェックマークのバッジを表示 */}
                  {isViewed && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-sm font-bold">
                      ✓ 視聴済み
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-between">
                  <h3 className="font-bold text-gray-900 mb-4">{video.title}</h3>
                  <Link href={`/video/${video.vimeo_id}`} className={`block w-full text-center px-4 py-2 font-medium text-sm rounded-md transition-colors ${
                    isViewed ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                  }`}>
                    {isViewed ? 'もう一度見る' : '視聴する'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}