import Link from 'next/link'

export const runtime = 'edge';

export default async function TermsPage({ params }: { params: Promise<{ lang: 'ja' | 'en' }> }) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
        <Link href={`/${lang}`} className="text-blue-600 hover:underline mb-8 inline-block font-medium">← Back to Home</Link>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 border-b pb-4">
          Terms of Service<br/>
          <span className="text-lg text-gray-500 font-normal mt-2 block">利用規約</span>
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms / 規約の同意</h3>
            <p>By accessing or using Nihon Work Base (the "Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.</p>
            <p className="text-sm text-gray-500 mt-2">Nihon Work Base（以下「本サービス」）を利用することにより、お客様は本規約に同意したものとみなされます。同意いただけない場合は、本サービスをご利用いただけません。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Subscription and Tickets / サブスクリプションとチケット</h3>
            <p>The Service is provided on a subscription basis ($35.00/month for up to 25 video views). Additional video views can be purchased via Tickets ($35.00 for 25 views). Unused base capacity resets at the end of each billing cycle. Purchased tickets are valid for 30 days from the date of purchase.</p>
            <p className="text-sm text-gray-500 mt-2">本サービスは月額制（月額35ドル/月間25本まで視聴可能）で提供されます。追加の視聴枠はチケット（35ドル/25本）にて購入可能です。月額プランの未使用の視聴枠は翌月に繰り越されません。購入した追加チケットの有効期限は、購入日から30日間です。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Prohibited Actions / 禁止事項</h3>
            <p>You agree not to engage in any of the following activities:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Sharing your account credentials with others (Account sharing).</li>
              <li>Downloading, recording, reproducing, or redistributing any video content provided by the Service.</li>
              <li>Attempting to bypass the viewing limit mechanisms.</li>
            </ul>
            <p className="mt-2 font-medium text-red-600">We reserve the right to immediately suspend or terminate accounts that violate these rules without any refund.</p>
            
            <div className="text-sm text-gray-500 mt-3 p-3 bg-gray-50 rounded">
              お客様は以下の行為を行わないことに同意します。<br/>
              ・アカウント情報を他者と共有し、複数人で使い回す行為。<br/>
              ・本サービスが提供する動画コンテンツのダウンロード、録画、複製、無断転載。<br/>
              ・視聴制限のシステムを不正に回避する行為。<br/>
              これらの違反が発覚した場合、運営者は予告なくアカウントを即時停止・削除する権利を有し、いかなる返金も行いません。
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Intellectual Property / 知的財産権</h3>
            <p>All content, including videos, text, and logos, is the exclusive property of Nihon Work Base. You are granted a limited, non-exclusive, non-transferable license to access and view the content for personal, non-commercial educational purposes.</p>
            <p className="text-sm text-gray-500 mt-2">動画、テキスト、ロゴを含むすべてのコンテンツの著作権および知的財産権は、Nihon Work Baseに帰属します。お客様には、個人的かつ非営利の学習目的に限り、コンテンツにアクセスし視聴する限定的かつ譲渡不可の権利が付与されます。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">5. Limitation of Liability / 免責事項</h3>
            <p>The Service is provided "as is". We do not guarantee continuous, uninterrupted access to the Service. We are not liable for any learning outcomes, damages, or losses resulting from the use or inability to use the Service.</p>
            <p className="text-sm text-gray-500 mt-2">本サービスは「現状有姿」で提供されます。運営者は、サービスの中断がないことを保証しません。また、本サービスの利用または利用不能から生じる学習結果、いかなる損害についても責任を負いません。</p>
          </section>
        </div>
      </div>
    </div>
  )
}