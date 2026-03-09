import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">日本語学習プラットフォームへようこそ</h1>
      <p className="mb-8 text-gray-600">質の高い授業動画で、日本語をマスターしましょう。</p>
      
      <Link
        href="/login"
        className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        ログイン / 新規登録画面へ進む
      </Link>
    </div>
  )
}