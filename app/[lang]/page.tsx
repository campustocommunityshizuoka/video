import Link from 'next/link'
import { getDictionary } from '@/utils/get-dictionary'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

export const runtime = 'edge';

export default async function HomePage({ params }: { params: Promise<{ lang: 'ja' | 'en' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* ナビゲーションバー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* ロゴとタイトルエリア：タイトルに truncate（三点リーダー）を設定 */}
          <div className="flex items-center gap-2 min-w-0 shrink">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl leading-none">あ</span>
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-gray-800 truncate">
              {dict.home.title}
            </span>
          </div>
          
          {/* ナビゲーションエリア：スマホでは要素を詰め、文字を小さく */}
          <nav className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <LanguageSwitcher currentLang={lang} />
            
            <Link 
              href={`/${lang}/login`} 
              className="text-[10px] sm:text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-1"
            >
              {dict.home.login}
            </Link>
            
            <Link 
              href={`/${lang}/login`} 
              className="text-[10px] sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors shadow-sm whitespace-nowrap"
            >
              {dict.home.startFree}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ヒーローセクション（ファーストビュー） */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-linear-to-b from-blue-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              {dict.home.heroTitle1}<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
                {dict.home.heroTitle2}
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              {dict.home.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href={`/${lang}/login`} 
                className="px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {dict.home.startNow}
              </Link>
              <a 
                href="#pricing" 
                className="px-8 py-4 text-base font-bold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-all"
              >
                {dict.home.viewPricing}
              </a>
            </div>
          </div>
          
          {/* 背景の装飾 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-blue-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </section>

        {/* 特徴・メリットセクション */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{dict.home.reasonsTitle}</h2>
              <p className="text-gray-600">{dict.home.reasonsDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* 特徴1 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{dict.home.feature1Title}</h3>
                <p className="text-gray-600">{dict.home.feature1Desc}</p>
              </div>

              {/* 特徴2 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{dict.home.feature2Title}</h3>
                <p className="text-gray-600">{dict.home.feature2Desc}</p>
              </div>

              {/* 特徴3 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{dict.home.feature3Title}</h3>
                <p className="text-gray-600">{dict.home.feature3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 料金プランプレビューセクション */}
        <section id="pricing" className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{dict.home.pricingTitle}</h2>
              <p className="text-gray-600">{dict.home.pricingDesc}</p>
            </div>

            {/* グリッドを1カラムに変更し、中央に配置 */}
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl p-8 border-2 border-blue-500 shadow-xl text-center relative">
                <h3 className="text-xl font-bold text-blue-600 mb-2">{dict.home.planStandard}</h3>
                <p className="text-5xl font-extrabold text-gray-900 mb-6">$35.00<span className="text-base font-normal text-gray-500">{dict.home.perMonth}</span></p>
                <ul className="text-left space-y-4 mb-8 text-gray-600 font-medium">
                  <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">✓</span> {dict.home.featureProgress}</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">✓</span> {dict.home.featureAllAccess}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA（コールトゥアクション）セクション */}
        <section className="py-20 bg-blue-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">{dict.home.ctaTitle}</h2>
            <p className="text-blue-100 text-lg mb-10">
              {dict.home.ctaDesc}
            </p>
            <Link 
              href={`/${lang}/login`} 
              className="inline-block px-10 py-4 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-gray-50 shadow-lg transition-colors"
            >
              {dict.home.createFreeAccount}
            </Link>
          </div>
        </section>
      </main>

      {/* フッターの修正案 */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">あ</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{dict.home.title}</span>
            </div>
            
            {/* 法的ページへのリンクを追加 */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link href={`/${lang}/terms`} className="hover:text-blue-600">Terms of Service</Link>
              <Link href={`/${lang}/privacy`} className="hover:text-blue-600">Privacy Policy</Link>
              <Link href={`/${lang}/legal`} className="hover:text-blue-600">Legal Notice (Act on Specified Commercial Transactions)</Link>
            </div>

            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {dict.home.footerRights}
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}