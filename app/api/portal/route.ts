import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

export const runtime = 'edge';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証されていません' }, { status: 401 })
    }

    // データベースから現在の契約のStripe IDを取得
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: '有効な契約が見つかりません' }, { status: 400 })
    }

    // Stripeから契約詳細を取得し、顧客ID（Customer ID）を特定
    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
    const customerId = stripeSub.customer as string

    // 顧客専用のポータル画面（URL）を生成
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://localhost:3000/dashboard', // ポータルから戻ってくる場所
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Portal Error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}