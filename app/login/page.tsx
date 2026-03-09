import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  // ログイン処理
  const signIn = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // 日本語をエンコードしてリダイレクト
      return redirect(`/login?message=${encodeURIComponent('ログインに失敗しました')}`)
    }
    return redirect('/dashboard')
  }

  // 新規登録処理
  const signUp = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      // 日本語をエンコードしてリダイレクト
      return redirect(`/login?message=${encodeURIComponent('登録に失敗しました')}`)
    }
    // 日本語をエンコードしてリダイレクト
    return redirect(`/login?message=${encodeURIComponent('確認メールを送信しました。メール内のリンクをクリックしてください。')}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form className="flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md gap-4">
        <h1 className="text-2xl font-bold text-center mb-4">ログイン / 新規登録</h1>
        
        <label className="text-sm font-medium" htmlFor="email">メールアドレス</label>
        <input
          className="px-4 py-2 border rounded-md"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-sm font-medium mt-2" htmlFor="password">パスワード</label>
        <input
          className="px-4 py-2 border rounded-md"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6} 
        />
        
        <div className="flex flex-col gap-2 mt-6">
          <button formAction={signIn} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            ログイン
          </button>
          <button formAction={signUp} className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
            新規登録
          </button>
        </div>
      </form>
    </div>
  )
}