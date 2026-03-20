import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const currentLang = formData.get('lang') as string || 'ja'
  
  // リクエストのURLからオリジン（ドメイン部分）を動的に取得します
  const origin = new URL(request.url).origin

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL(`/${currentLang}/login`, request.url), 303)
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (!subscription) {
      return NextResponse.redirect(new URL(`/${currentLang}/dashboard`, request.url), 303)
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-02-25.clover',
    })

    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
    const customerId = stripeSub.customer as string

    // Stripe上の顧客の言語設定を現在の言語で上書き保存します
    await stripe.customers.update(customerId, {
      preferred_locales: [currentLang === 'ja' ? 'ja' : 'en']
    });

    // 動的に取得したoriginを使ってreturn_urlを設定します
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/${currentLang}/dashboard`,
      locale: currentLang === 'ja' ? 'ja' : 'en'
    })

    if (session.url) {
      // StripeのURLへリダイレクトさせます
      return NextResponse.redirect(session.url, 303)
    }
    
    return NextResponse.redirect(new URL(`/${currentLang}/dashboard`, request.url), 303)
    
  } catch (error: any) {
    console.error('Portal Error:', error)
    return NextResponse.redirect(new URL(`/${currentLang}/dashboard`, request.url), 303)
  }
}