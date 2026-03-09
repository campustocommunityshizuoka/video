import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  const supabase = await createClient()

  // 1. 新規購入、2. プラン変更、3. 解約のイベントを処理
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const object = event.data.object as Stripe.Checkout.Session | Stripe.Subscription
    
    // サブスクリプションIDの取得
    let stripeSubscriptionId: string
    if (event.type === 'checkout.session.completed') {
      const session = object as Stripe.Checkout.Session
      stripeSubscriptionId = session.subscription as string
    } else {
      const subscription = object as Stripe.Subscription
      stripeSubscriptionId = subscription.id
    }
    
    // Stripeから最新のサブスク情報を取得
    const fullSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId) as Stripe.Subscription
    const subscriptionItem = fullSubscription.items.data[0]

    // ユーザーIDの特定
    let userId: string | undefined

    if (event.type === 'checkout.session.completed') {
      const session = object as Stripe.Checkout.Session
      userId = session.metadata?.userId
    } else {
      // 既存の契約更新や削除の場合は、DBからstripe_subscription_idを元にユーザーを特定
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .maybeSingle()
      userId = existingSub?.user_id
    }

    if (userId) {
      const planId = subscriptionItem.price.id
      let planType = 'light'
      if (planId === process.env.STRIPE_PRICE_ID_STANDARD) planType = 'standard'
      if (planId === process.env.STRIPE_PRICE_ID_PREMIUM) planType = 'premium'

      // データベースの更新
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: stripeSubscriptionId,
        plan_type: planType,
        status: fullSubscription.status,
        current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })

      if (error) {
        console.error('Database Update Error:', error.message)
      }
    }
  }

  return NextResponse.json({ received: true })
}