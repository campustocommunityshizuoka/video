import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

// Stripeの初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover',
})

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ★追加：すでに有効な契約があるかチェックします
  // ※万が一複数あってもエラーで止まらないよう .limit(1).maybeSingle() を使用します
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  const handleCheckout = async (formData: FormData) => {
    'use server'
    
    // ★追加：裏側（サーバー側）でも二重決済を厳重にブロックします
    const supabaseAdmin = await createClient()
    const { data: checkSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)

    if (checkSub && checkSub.length > 0) {
      redirect('/dashboard?message=' + encodeURIComponent('すでにプランを契約中のため、追加購入はできません'))
    }

    const priceId = formData.get('priceId') as string

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:3000/dashboard?success=true`,
      cancel_url: `http://localhost:3000/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    })

    if (session.url) {
      redirect(session.url)
    }
  }

  // すでに契約中の場合はボタンを無効化するための変数
  const isSubscribed = !!existingSubscription

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            学習プランを選択
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            あなたの学習ペースに合わせたプランをお選びください。
          </p>
        </div>

        {/* ★追加：契約中のユーザーへのメッセージ */}
        {isSubscribed && (
          <div className="mt-8 max-w-3xl mx-auto bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-sm">
            <p className="font-bold">お知らせ</p>
            <p>お客様はすでにプランをご契約中です。現在のプランの解約や変更をご希望の場合は、管理者までお問い合わせください。</p>
          </div>
        )}

        <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          
          {/* ライトプラン */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">ライトプラン</h3>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">¥1,000</span>
                <span className="text-base font-medium text-gray-500">/月</span>
              </p>
              <form action={handleCheckout} className="mt-8">
                <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_ID_LIGHT} />
                <button 
                  type="submit" 
                  disabled={isSubscribed}
                  className={`w-full text-white rounded-md py-2 text-sm font-semibold transition-colors ${
                    isSubscribed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubscribed ? '契約済み' : 'プランを選択'}
                </button>
              </form>
            </div>
          </div>

          {/* スタンダードプラン */}
          <div className="border border-blue-500 rounded-lg shadow-md divide-y divide-gray-200 bg-white relative">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">スタンダードプラン</h3>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">¥3,000</span>
                <span className="text-base font-medium text-gray-500">/月</span>
              </p>
              <form action={handleCheckout} className="mt-8">
                <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_ID_STANDARD} />
                <button 
                  type="submit" 
                  disabled={isSubscribed}
                  className={`w-full text-white rounded-md py-2 text-sm font-semibold transition-colors ${
                    isSubscribed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSubscribed ? '契約済み' : 'プランを選択'}
                </button>
              </form>
            </div>
          </div>

          {/* プレミアムプラン */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">プレミアムプラン</h3>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">¥5,000</span>
                <span className="text-base font-medium text-gray-500">/月</span>
              </p>
              <form action={handleCheckout} className="mt-8">
                <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_ID_PREMIUM} />
                <button 
                  type="submit" 
                  disabled={isSubscribed}
                  className={`w-full text-white rounded-md py-2 text-sm font-semibold transition-colors ${
                    isSubscribed ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {isSubscribed ? '契約済み' : 'プランを選択'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}