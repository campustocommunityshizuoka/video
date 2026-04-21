import Link from 'next/link'

export const runtime = 'edge';

export default async function PrivacyPage({ params }: { params: Promise<{ lang: 'ja' | 'en' }> }) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
        <Link href={`/${lang}`} className="text-blue-600 hover:underline mb-8 inline-block font-medium">← Back to Home</Link>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 border-b pb-4">
          Privacy Policy<br/>
          <span className="text-lg text-gray-500 font-normal mt-2 block">プライバシーポリシー（個人情報の取り扱い）</span>
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect / 収集する情報</h3>
            <p>We collect information you provide directly to us when you create an account, such as your email address and password. We also collect data regarding your usage of the Service, such as video viewing history and progress.</p>
            <p className="text-sm text-gray-500 mt-2">当サイトは、アカウント作成時にお客様が提供するメールアドレスおよびパスワードを収集します。また、動画の視聴履歴や学習進捗などのサービス利用状況に関するデータも自動的に収集します。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Payment Information / 決済情報について</h3>
            <p>All subscription and ticket payments are processed securely by our third-party payment processor, Stripe. <strong className="text-blue-600">We do not store or process your credit card numbers on our servers.</strong></p>
            <p className="text-sm text-gray-500 mt-2">すべてのサブスクリプションおよびチケットの支払いは、外部の決済代行サービスであるStripeによって安全に処理されます。<strong className="text-blue-600">当サイトのサーバーには、お客様のクレジットカード番号等の決済情報は一切保存されません。</strong></p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Use of Information / 情報の利用目的</h3>
            <p>We use the collected information to provide, maintain, and improve the Service, to process your transactions, and to communicate with you regarding your account and customer support.</p>
            <p className="text-sm text-gray-500 mt-2">収集した情報は、サービスの提供、維持、改善、取引の処理、およびアカウントやカスタマーサポートに関するお客様との連絡のために使用されます。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services / 第三者サービスへの提供</h3>
            <p>We use Supabase for authentication and database management, and Stripe for payment processing. Your data may be shared with these trusted partners solely for the purpose of providing the Service.</p>
            <p className="text-sm text-gray-500 mt-2">当サイトは、ユーザー認証およびデータベース管理にSupabaseを、決済処理にStripeを使用しています。お客様のデータは、サービスの提供を目的としてのみ、これらの信頼できるパートナーと共有される場合があります。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">5. International Data Transfers / データの越境移転</h3>
            <p>Your information may be transferred to and maintained on servers located outside of your country or jurisdiction. By using the Service, you consent to this transfer.</p>
            <p className="text-sm text-gray-500 mt-2">お客様の情報は、お客様の居住国以外の国にあるサーバーに転送され、保管される場合があります。本サービスを利用することにより、お客様はこのデータの転送に同意したものとみなされます。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">6. Contact Us / お問い合わせ</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="font-medium text-blue-600 mt-1">[support@yourdomain.com]</p>
            <p className="text-sm text-gray-500 mt-2">本プライバシーポリシーに関するご質問は、上記のメールアドレスまでお問い合わせください。</p>
          </section>
        </div>
      </div>
    </div>
  )
}