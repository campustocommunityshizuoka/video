import Link from 'next/link'

export const runtime = 'edge';

export default async function LegalPage({ params }: { params: Promise<{ lang: 'ja' | 'en' }> }) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
        <Link href={`/${lang}`} className="text-blue-600 hover:underline mb-8 inline-block font-medium">← Back to Home</Link>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 border-b pb-4">
          Legal Notice (Act on Specified Commercial Transactions)<br/>
          <span className="text-lg text-gray-500 font-normal mt-2 block">特定商取引法に基づく表記</span>
        </h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-bold text-gray-900">Distributor / 販売事業者名</h3>
            <p className="mt-1">[株式会社皆昇企画 / 株式会社皆昇企画]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Representative / 運営統括責任者</h3>
            <p className="mt-1">[Takaaki Higashi / 東敬晃]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Address / 所在地</h3>
            <p className="mt-1">[Room 102, Life in Escort,5 Maeshibacho Higashitsutsumi, Toyohashi, Aichi, 4410152, Japan / 4410152、愛知県豊橋市前芝町東堤5番地ライフインエスコート102号室]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Phone Number / 電話番号</h3>
            <p className="mt-1">[+81-90-7918-7828 / 090-7918-7828]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Email Address / メールアドレス</h3>
            <p className="mt-1">[rise@kisyou.world]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Selling Price / 販売価格</h3>
            <p className="mt-1">
              Standard Plan (Subscription): $35.00 / month<br/>
              Additional Tickets (One-time): $35.00 / 25 tickets<br/>
              <span className="text-sm text-gray-500">
                基本プラン（月額）: 35.00ドル<br/>
                追加チケット（買い切り）: 35.00ドル（25本分）
              </span>
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Additional Fees / 商品代金以外の必要料金</h3>
            <p className="mt-1">Internet connection fees and communication charges are the responsibility of the customer.</p>
            <p className="text-sm text-gray-500 mt-1">本サービスの利用に必要となるインターネット接続料金、通信料金等はお客様の負担となります。</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Payment Method / 支払方法</h3>
            <p className="mt-1">Credit Card (processed via Stripe)</p>
            <p className="text-sm text-gray-500 mt-1">クレジットカード決済（Stripeを通じた決済）</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Delivery Time / 引き渡し時期</h3>
            <p className="mt-1">The service is available immediately after the payment is successfully processed.</p>
            <p className="text-sm text-gray-500 mt-1">クレジットカード決済完了後、ただちにご利用いただけます。</p>
          </div>

          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <h3 className="font-bold text-red-800">Returns and Cancellations / 返品・キャンセル（返金ポリシー）</h3>
            <p className="mt-2 text-red-900">
              Due to the nature of digital content, we do not accept returns or offer refunds after a purchase has been made.
              You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing cycle, and you will not be charged again. We do not provide prorated refunds for cancellations made during an active billing period.
            </p>
            <p className="text-sm text-red-700 mt-2 border-t border-red-200 pt-2">
              デジタルコンテンツという商品の性質上、購入確定後の返品・返金には一切応じられません。<br/>
              サブスクリプションの解約はいつでも可能です。解約手続きを行った場合、現在の請求期間の終了日をもって自動更新が停止されます。請求期間の途中で解約された場合でも、日割り計算による返金は行いません。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}