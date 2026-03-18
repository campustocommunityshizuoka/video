import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js' // ★追加：管理者権限用クライアント
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

export const runtime = 'edge';

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  // ★修正：RLSを無視して全データを取得できる管理者用クライアントを作成
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 管理者用クライアントを使ってサブスクリプション情報を取得
  const { data: subscriptions } = await supabaseAdmin.from('subscriptions').select('*')
  const activeSubs = subscriptions?.filter(sub => sub.status === 'active') || []
  
  const lightCount = activeSubs.filter(sub => sub.plan_type === 'light').length
  const standardCount = activeSubs.filter(sub => sub.plan_type === 'standard').length
  const premiumCount = activeSubs.filter(sub => sub.plan_type === 'premium').length

  const { data: videos } = await supabase.from('videos').select('*').order('created_at', { ascending: false })

  const addVideo = async (formData: FormData) => {
    'use server'
    const title = formData.get('title') as string
    const vimeo_id = formData.get('vimeo_id') as string
    
    if (!title || !vimeo_id) return

    const supabaseServer = await createClient()
    await supabaseServer.from('videos').insert({ title, vimeo_id })
    
    revalidatePath('/admin')
  }

  const deleteVideo = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string
    
    const supabaseServer = await createClient()
    await supabaseServer.from('videos').delete().eq('id', id)
    
    revalidatePath('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div>
            <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Admin Mode</span>
            <h1 className="text-2xl font-bold text-white">運営管理ダッシュボード</h1>
          </div>
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
            一般画面へ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">現在の有料会員数</h2>
              <div className="text-4xl font-extrabold text-blue-400 mb-6">{activeSubs.length} <span className="text-base font-normal text-gray-400">名</span></div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">ライトプラン</span>
                  <span className="font-bold text-white">{lightCount} 名</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-400">スタンダード</span>
                  <span className="font-bold text-white">{standardCount} 名</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-400">プレミアム</span>
                  <span className="font-bold text-white">{premiumCount} 名</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">新しい動画を登録</h2>
              <form action={addVideo} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">セクション番号（例: 2-1）</label>
                  <input type="text" name="title" id="title" required className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2-1" />
                </div>
                <div>
                  <label htmlFor="vimeo_id" className="block text-sm font-medium text-gray-400 mb-1">Vimeo ID（数字のみ）</label>
                  <input type="text" name="vimeo_id" id="vimeo_id" required className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123456789" />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors mt-2">追加する</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg h-full max-h-[800px] flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h2 className="text-lg font-bold text-white">登録済み動画一覧</h2>
                <span className="text-sm text-gray-400">計 {videos?.length || 0} 本</span>
              </div>
              <div className="overflow-y-auto pr-2 flex-grow space-y-2">
                {videos?.map(video => (
                  <div key={video.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                    <div><span className="text-blue-400 font-bold mr-3">{video.title}</span><span className="text-sm text-gray-400">ID: {video.vimeo_id}</span></div>
                    <form action={deleteVideo}><input type="hidden" name="id" value={video.id} /><DeleteButton /></form>
                  </div>
                ))}
                {(!videos || videos.length === 0) && <p className="text-gray-500 text-center py-8">動画が登録されていません。</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}