import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Stripe from 'stripe'

// Stripeの初期化


export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. ユーザー情報の取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. 契約情報の取得
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  // 3. 動画一覧データの取得
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: true })

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'light': return 'ライトプラン（月10本）'
      case 'standard': return 'スタンダードプラン（月30本）'
      case 'premium': return 'プレミアムプラン（無制限）'
      default: return '未契約'
    }
  }

  // ログアウト処理
  const signOut = async () => {
    'use server'
    const supabaseClient = await createClient()
    await supabaseClient.auth.signOut()
    redirect('/login')
  }

  // ★修正：Stripeポータルへ移動する処理（直接ここでURLを発行します）
  const goToBillingPortal = async () => {
    'use server'

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover',
  })

    if (!subscription) return

    // Stripeから顧客IDを特定
    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
    const customerId = stripeSub.customer as string

    // 顧客専用のポータル画面URLを生成
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://localhost:3000/dashboard', 
    })

    // Stripeのページへジャンプ！
    if (session.url) {
      redirect(session.url)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">マイページ</h1>
          <form action={signOut}>
            <button className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50">
              ログアウト
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-10">
          <p className="mb-4 text-gray-600">ようこそ、{user.email} さん</p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-md p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">現在のご契約状況</h2>
            {subscription ? (
              <div>
                <p className="text-xl font-bold text-blue-900 mb-2">
                  {getPlanName(subscription.plan_type)}
                </p>
                <p className="text-sm text-blue-700 mb-4">
                  契約更新日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
                </p>
                
                {/* ★修正されたボタン：直接サーバーアクションを呼び出します */}
                <form action={goToBillingPortal}>
                  <button type="submit" className="text-sm bg-white border border-blue-300 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors">
                    契約内容の確認・解約（Stripe）
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <p className="text-blue-600 mb-4">プラン未契約です。</p>
                <Link href="/pricing" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  プラン選択画面へ
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">授業動画一覧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos?.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  <img src={video.thumbnail_url} alt="" className="object-cover w-full h-full" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{video.title}</h3>
                  <Link href={`/video/${video.vimeo_id}`} className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-md hover:bg-blue-100">
                    視聴する
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}