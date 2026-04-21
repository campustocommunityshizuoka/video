import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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

        <div className="mt-12 max-w-md mx-auto">
          
          {/* 基本プラン（旧スタンダードプラン）のみを残す */}
          <div className="border border-blue-500 rounded-lg shadow-md divide-y divide-gray-200 bg-white relative">
            <div className="p-8 text-center">
              <h3 className="text-xl leading-6 font-bold text-gray-900">{dict.pricing.planStandard}</h3>
              <p className="mt-8">
                <span className="text-5xl font-extrabold text-gray-900">{dict.pricing.priceStandard}</span>
                <span className="text-lg font-medium text-gray-500">{dict.pricing.perMonth}</span>
              </p>
              <form action="/api/checkout" method="POST" className="mt-8">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="priceId" value={process.env.STRIPE_PRICE_ID_STANDARD || ''} />
                <button 
                  type="submit" 
                  disabled={isSubscribed}
                  className={`w-full text-white rounded-md py-3 text-base font-bold transition-colors ${
                    isSubscribed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isSubscribed ? dict.pricing.subscribed : dict.pricing.selectPlan}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-[11px] text-gray-400">
          <Link href={`/${lang}/terms`} className="hover:text-blue-600 transition-colors">Terms of Service</Link>
          <Link href={`/${lang}/privacy`} className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
          <Link href={`/${lang}/legal`} className="hover:text-blue-600 transition-colors">Legal Notice</Link>
          <span>© {new Date().getFullYear()} Nihongo Learning</span>
        </div>
      </footer>
    </div>
  )
}