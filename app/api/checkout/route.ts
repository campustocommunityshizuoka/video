import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

export const runtime = 'edge';

export async function POST(request: Request) {
  const formData = await request.formData()
  const currentLang = formData.get('lang') as string || 'ja'
  const priceId = formData.get('priceId') as string
  const type = formData.get('type') as string;
  
  // URLから動的にオリジンを取得
  const origin = new URL(request.url).origin

  const isAddOn = type === 'addon' || priceId === process.env.STRIPE_PRICE_ID_ADDON;

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL(`/${currentLang}/login`, request.url), 303)
    }

// 現在のアクティブなサブスクを取得
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!isAddOn && subscription) {
      const errorMsg = currentLang === 'ja' 
        ? 'すでにプランを契約中のため、新しく契約することはできません。' 
        : 'You already have an active subscription.';
      return NextResponse.redirect(new URL(`/${currentLang}/dashboard?message=${encodeURIComponent(errorMsg)}`, request.url), 303)
    }

      // 2. 有効な追加チケットの残数を合計
      if (isAddOn && subscription) {
      const baseLimit = 25;

      // 有効なチケットの残数を取得
      const { data: credits } = await supabase
        .from('video_credits')
        .select('remaining')
        .eq('user_id', user.id)
        .gt('remaining', 0)
        .gt('expires_at', new Date().toISOString());

      const totalAdditional = credits?.reduce((acc, curr) => acc + curr.remaining, 0) || 0;

      // 合計（基本枠 + 追加枠）が100本以上ならブロック
      if (baseLimit + totalAdditional >= 100) {
        const errorMsg = currentLang === 'ja' 
          ? '視聴枠の合計が上限（100本）に達しているため、追加購入はできません。' 
          : 'Total capacity has reached the limit (100).';
        return NextResponse.redirect(new URL(`/${currentLang}/dashboard?message=${encodeURIComponent(errorMsg)}`, request.url), 303)
      }
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-02-25.clover',
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      // 追加枠なら 'payment' (単発払い)、プランなら 'subscription' (継続)
      mode: isAddOn ? 'payment' : 'subscription', 
      success_url: `${origin}/${currentLang}/dashboard?success=true`,
      cancel_url: `${origin}/${currentLang}/pricing?canceled=true`,
      customer_email: user.email,
      locale: currentLang === 'ja' ? 'ja' : 'en',
      metadata: { 
        userId: user.id,
        purchaseType: isAddOn ? 'addon' : 'subscription' // Webhookで判別するために必須
      },
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