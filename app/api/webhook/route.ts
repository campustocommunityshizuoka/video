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
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. 【最優先】チェックアウト完了イベントの処理
  console.log('--- Webhook受信開始 ---');
  console.log('Event Type:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // ★重要：ここに出る値をチェックしてください
    console.log('受信したメタデータ:', session.metadata);
    console.log('判定用の購入タイプ:', session.metadata?.purchaseType);

    if (session.metadata?.purchaseType === 'addon') {
      console.log('★アドオン購入（チケット）のブロックに進入しました');
      
      const userId = session.metadata.userId;
      if (userId) {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // INSERT実行
        const { data, error } = await supabaseAdmin.from('video_credits').insert({
          user_id: userId,
          amount: 25,
          remaining: 25,
          expires_at: expiresAt.toISOString(),
        }).select();

        if (error) {
          console.error('❌DB挿入エラー:', error.message);
        } else {
          console.log('✅DB挿入成功！挿入されたデータ:', data);
        }
      } else {
        console.log('❌userIdがメタデータにありません');
      }
      return NextResponse.json({ received: true });
    } else {
      console.log('⚠️ purchaseTypeがaddonではありません（サブスクとして処理されます）');
    }
  }

  // 2. 【サブスクリプション用】更新・削除・新規契約のロジック
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const object = event.data.object as Stripe.Checkout.Session | Stripe.Subscription
    
    let stripeSubscriptionId: string
    if (event.type === 'checkout.session.completed') {
      const session = object as Stripe.Checkout.Session
      stripeSubscriptionId = session.subscription as string
    } else {
      const subscription = object as Stripe.Subscription
      stripeSubscriptionId = subscription.id
    }

    // アドオンでない場合のみ、Stripeから詳細なサブスク情報を取得
    if (stripeSubscriptionId) {
      const fullSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId) as Stripe.Subscription
      const subscriptionItem = fullSubscription.items.data[0]
      const planId = subscriptionItem.price.id

      let userId: string | undefined
      if (event.type === 'checkout.session.completed') {
        const session = object as Stripe.Checkout.Session
        userId = session.metadata?.userId
      } else {
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', stripeSubscriptionId)
          .maybeSingle()
        userId = existingSub?.user_id
      }

      if (userId) {
        let planType = 'light'
        if (planId === process.env.STRIPE_PRICE_ID_STANDARD) planType = 'standard'
        if (planId === process.env.STRIPE_PRICE_ID_PREMIUM) planType = 'premium'

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: stripeSubscriptionId,
          plan_type: planType,
          status: fullSubscription.status,
          current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' })
        
        console.log(`★サブスクDB更新完了: ${planType}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}