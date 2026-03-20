import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js' // ★変更: 公式の標準クライアントを使用します
import Stripe from 'stripe'

export const runtime = 'edge';

export async function POST(req: Request) {


  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover',
    httpClient: Stripe.createFetchHttpClient(),
  })
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    // 変更: 同期メソッドから非同期メソッド（Edge/Web Crypto対応）へ変更します
    event = await stripe.webhooks.constructEventAsync(body, sig, endpointSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook Error: ${message}`)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // ★重要: 管理者権限（Service Role）でSupabaseクライアントを初期化します
  // これにより、ログイン情報（Cookie）がないWebhookからの通信でもデータベースを操作できます
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // .env.local に必ず追加してください
  )

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
      console.log('新規契約: userIdをメタデータから取得 ->', userId) // ★デバッグログ
    } else {
      console.log('契約更新/解約: StripeサブスクIDでユーザーを検索 ->', stripeSubscriptionId) // ★デバッグログ
      // ★ supabaseAdmin を使用して既存の契約からユーザーを特定
      const { data: existingSub, error: searchError } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .maybeSingle()
      
      if (searchError) {
        console.error('ユーザー検索エラー:', searchError.message) // ★デバッグログ
      }
      
      userId = existingSub?.user_id
      console.log('検索結果のuserId ->', userId) // ★デバッグログ
    }

    if (userId) {
      const planId = subscriptionItem.price.id

// ★ここからデバッグログを追加
      console.log('--- プラン判定のデバッグ ---')
      console.log('Stripeから受信したPrice ID:', planId)
      console.log('環境変数(STANDARD)の値:', process.env.STRIPE_PRICE_ID_STANDARD)
      console.log('環境変数(PREMIUM)の値:', process.env.STRIPE_PRICE_ID_PREMIUM)
      console.log('----------------------------')
      // ★ここまで

      let planType = 'light'
      if (planId === process.env.STRIPE_PRICE_ID_STANDARD) planType = 'standard'
      if (planId === process.env.STRIPE_PRICE_ID_PREMIUM) planType = 'premium'

      console.log('DBを更新します。ユーザー:', userId, 'プラン:', planType, 'ステータス:', fullSubscription.status) // ★デバッグログ

      // ★ supabaseAdmin を使用してデータベースを更新
      const { error } = await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: stripeSubscriptionId,
        plan_type: planType,
        status: fullSubscription.status,
        current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })

      if (error) {
        console.error('★Database Update Error:', error.message) // ★デバッグログ
      } else {
        console.log('★DBの更新に成功しました！') // ★デバッグログ
      }
    } else {
      console.log('★userIdが特定できなかったため、DB更新をスキップしました') // ★デバッグログ
    }
  }

  return NextResponse.json({ received: true })
}