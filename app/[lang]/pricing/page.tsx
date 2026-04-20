import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
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

  const getPriceId = (plan: 'light' | 'standard' | 'premium', currentLang: string) => {
    if (plan === 'light') return process.env.STRIPE_PRICE_ID_LIGHT;
    if (plan === 'standard') return process.env.STRIPE_PRICE_ID_STANDARD;
    if (plan === 'premium') return process.env.STRIPE_PRICE_ID_PREMIUM;
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

          {/* スタンダードプラン */}
          <div className="border border-blue-500 rounded-lg shadow-md divide-y divide-gray-200 bg-white relative">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{dict.pricing.planStandard}</h3>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{dict.pricing.priceStandard}</span>
                <span className="text-base font-medium text-gray-500">{dict.pricing.perMonth}</span>
              </p>
              <form action="/api/checkout" method="POST" className="mt-8">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="priceId" value={getPriceId('standard', lang) || ''} />
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

        </div>
      </div>
    </div>
  )
}