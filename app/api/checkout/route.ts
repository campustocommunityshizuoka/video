import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const currentLang = formData.get('lang') as string || 'ja'
  const priceId = formData.get('priceId') as string
  
  // URLから動的にオリジンを取得
  const origin = new URL(request.url).origin

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL(`/${currentLang}/login`, request.url), 303)
    }

    const { data: checkSub } = await supabase
      .from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'active').limit(1)

    if (checkSub && checkSub.length > 0) {
      const errorMsg = currentLang === 'ja' ? 'すでにプランを契約中のため、追加購入はできません' : 'You are already subscribed to a plan. Additional purchases are not allowed.'
      return NextResponse.redirect(new URL(`/${currentLang}/dashboard?message=${encodeURIComponent(errorMsg)}`, request.url), 303)
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-02-25.clover',
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/${currentLang}/dashboard?success=true`,
      cancel_url: `${origin}/${currentLang}/pricing?canceled=true`,
      customer_email: user.email,
      locale: currentLang === 'ja' ? 'ja' : 'en',
      metadata: { userId: user.id },
    })

    if (session.url) {
      return NextResponse.redirect(session.url, 303)
    }
    
    return NextResponse.redirect(new URL(`/${currentLang}/pricing`, request.url), 303)
    
  } catch (error: any) {
    console.error('Checkout Error:', error)
    return NextResponse.redirect(new URL(`/${currentLang}/pricing?error=true`, request.url), 303)
  }
}