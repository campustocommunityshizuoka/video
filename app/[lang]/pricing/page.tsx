import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

export const runtime = 'edge';

export default async function PricingPage({ params }: { params: Promise<{ lang: 'ja' | 'en' }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  const { data: existingSubscription } = await supabase
    .from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()

  // ★将来のための準備：言語（通貨）に応じた価格IDを返す関数
  const getPriceId = (plan: 'light' | 'standard' | 'premium', currentLang: string) => {
    /* * 将来、StripeダッシュボードでUSD用の価格を作成したら、
     * ここで process.env.STRIPE_PRICE_ID_LIGHT_USD などを返すように変更してください。
     * 現在はプレースホルダーとして、どちらの言語でも既存のIDを返しています。
     */
    if (plan === 'light') return process.env.STRIPE_PRICE_ID_LIGHT;
    if (plan === 'standard') return process.env.STRIPE_PRICE_ID_STANDARD;
    if (plan === 'premium') return process.env.STRIPE_PRICE_ID_PREMIUM;
  }

const handleCheckout = async (formData: FormData) => {
    'use server'
    const currentLang = formData.get('lang') as string
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2026-02-25.clover' })

    const supabaseAdmin = await createClient()
    const { data: checkSub } = await supabaseAdmin
      .from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'active').limit(1)

    if (checkSub && checkSub.length > 0) {
      const errorMsg = currentLang === 'ja' ? 'すでにプランを契約中のため、追加購入はできません' : 'You are already subscribed to a plan. Additional purchases are not allowed.'
      redirect(`/${currentLang}/dashboard?message=` + encodeURIComponent(errorMsg))
    }

    const priceId = formData.get('priceId') as string

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `http://localhost:3000/${currentLang}/dashboard?success=true`,
      cancel_url: `http://localhost:3000/${currentLang}/pricing?canceled=true`,
      customer_email: user.email,
      // ★確認：決済画面の表示言語を強制的に指定します
      locale: currentLang === 'ja' ? 'ja' : 'en',
      metadata: { userId: user.id },
    })

    if (session.url) redirect(session.url)
  }

  const isSubscribed = !!existingSubscription

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher currentLang={lang} />
      </div>

      <div className="max-w-7xl mx-auto mt-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{dict.pricing.title}</h2>
          <p className="mt-4 text-xl text-gray-600">{dict.pricing.subtitle}</p>
        </div>

        {isSubscribed && (
          <div className="mt-8 max-w-3xl mx-auto bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-sm">
            <p className="font-bold">{dict.pricing.noticeTitle}</p>
            <p>{dict.pricing.noticeMessage}</p>
          </div>
        )}

        <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          
          {/* ライトプラン */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{dict.pricing.planLight}</h3>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{dict.pricing.priceLight}</span>
                <span className="text-base font-medium text-gray-500">{dict.pricing.perMonth}</span>
              </p>
              <form action={handleCheckout} className="mt-8">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="priceId" value={getPriceId('light', lang)} />
                <button 
                  type="submit" 
                  disabled={isSubscribed}
                  className={`w-full text-white rounded-md py-2 text-sm font-semibold transition-colors ${
                    isSubscribed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubscribed ? dict.pricing.subscribed : dict.pricing.selectPlan}
                </button>
              </form>
            </div>
          </div>

          {/* スタンダードプラン */}
          <div className="border border-blue-500 rounded-lg shadow-md divide-y divide-gray-200 bg-white relative">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{dict.pricing.planStandard}</h3>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{dict.pricing.priceStandard}</span>
                <span className="text-base font-medium text-gray-500">{dict.pricing.perMonth}</span>
              </p>
              <form action={handleCheckout} className="mt-8">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="priceId" value={getPriceId('standard', lang)} />
                <button 
                  type="submit" 
                  disabled={isSubscribed}
                  className={`w-full text-white rounded-md py-2 text-sm font-semibold transition-colors ${
                    isSubscribed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSubscribed ? dict.pricing.subscribed : dict.pricing.selectPlan}
                </button>
              </form>
            </div>
          </div>

          {/* プレミアムプラン */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{dict.pricing.planPremium}</h3>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{dict.pricing.pricePremium}</span>
                <span className="text-base font-medium text-gray-500">{dict.pricing.perMonth}</span>
              </p>
              <form action={handleCheckout} className="mt-8">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="priceId" value={getPriceId('premium', lang)} />
                <button 
                  type="submit" 
                  disabled={isSubscribed}
                  className={`w-full text-white rounded-md py-2 text-sm font-semibold transition-colors ${
                    isSubscribed ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {isSubscribed ? dict.pricing.subscribed : dict.pricing.selectPlan}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}