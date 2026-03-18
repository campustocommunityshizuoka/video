import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* ナビゲーションバー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">あ</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">Nihongo Learning</span>
          </div>
          <nav>
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mr-6"
            >
              ログイン
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors shadow-sm"
            >
              無料ではじめる
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ヒーローセクション（ファーストビュー） */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              あなたのペースで、<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                確実な日本語力を。
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              100本以上の高品質な授業動画が見放題。体系化されたカリキュラムで、日常会話からビジネス日本語まで、最短ルートでマスターしましょう。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/login" 
                className="px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                今すぐ学習をスタート
              </Link>
              <a 
                href="#pricing" 
                className="px-8 py-4 text-base font-bold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-all"
              >
                料金プランを見る
              </a>
            </div>
          </div>
          
          {/* 背景の装飾 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </section>

        {/* 特徴・メリットセクション */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">選ばれる3つの理由</h2>
              <p className="text-gray-600">効率的に日本語を習得するための、最適な環境が整っています。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* 特徴1 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">圧倒的な質の授業動画</h3>
                <p className="text-gray-600">プロの日本語教師による、わかりやすい解説動画。いつでもどこでも、何度でも見返すことができます。</p>
              </div>

              {/* 特徴2 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">進捗がひと目でわかる</h3>
                <p className="text-gray-600">セクションごとの学習達成度をパーセンテージで可視化。モチベーションを維持しながら学習を進められます。</p>
              </div>

              {/* 特徴3 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">選べる柔軟な料金プラン</h3>
                <p className="text-gray-600">あなたの学習ペースに合わせて、ライトから無制限のプレミアムまで、3つのプランをご用意しています。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 料金プランプレビューセクション */}
        <section id="pricing" className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">シンプルな料金体系</h2>
              <p className="text-gray-600">登録は無料です。まずはアカウントを作成し、あなたに合ったプランをお選びください。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* プラン1 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
                <h3 className="text-lg font-medium text-gray-500 mb-2">ライト</h3>
                <p className="text-4xl font-extrabold text-gray-900 mb-6">¥1,000<span className="text-base font-normal text-gray-500"> / 月</span></p>
                <ul className="text-left space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 月間 10本まで視聴可能</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 進捗管理機能</li>
                </ul>
              </div>
              
              {/* プラン2（おすすめ） */}
              <div className="bg-white rounded-2xl p-8 border-2 border-blue-500 shadow-xl text-center relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">一番人気</div>
                <h3 className="text-lg font-medium text-blue-600 mb-2">スタンダード</h3>
                <p className="text-4xl font-extrabold text-gray-900 mb-6">¥3,000<span className="text-base font-normal text-gray-500"> / 月</span></p>
                <ul className="text-left space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 月間 30本まで視聴可能</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 進捗管理機能</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 全セクションへのアクセス</li>
                </ul>
              </div>

              {/* プラン3 */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-sm text-center text-white">
                <h3 className="text-lg font-medium text-gray-400 mb-2">プレミアム</h3>
                <p className="text-4xl font-extrabold text-white mb-6">¥5,000<span className="text-base font-normal text-gray-400"> / 月</span></p>
                <ul className="text-left space-y-3 mb-8 text-gray-300">
                  <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> 動画視聴 無制限</li>
                  <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> 進捗管理機能</li>
                  <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> 全セクションへのアクセス</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA（コールトゥアクション）セクション */}
        <section className="py-20 bg-blue-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">さあ、新しい言語の扉を開きましょう。</h2>
            <p className="text-blue-100 text-lg mb-10">
              アカウント作成はわずか1分で完了します。
            </p>
            <Link 
              href="/login" 
              className="inline-block px-10 py-4 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-gray-50 shadow-lg transition-colors"
            >
              無料でアカウントを作成する
            </Link>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs leading-none">あ</span>
            </div>
            <span className="text-lg font-bold text-gray-600">Nihongo Learning</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Nihongo Learning. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}