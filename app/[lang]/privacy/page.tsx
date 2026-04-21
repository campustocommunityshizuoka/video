// app/[lang]/terms/page.tsx
import { getDictionary } from '@/utils/get-dictionary'
import Link from 'next/link'

export const runtime = 'edge';

export default async function TermsPage({ params }: { params: Promise<{ lang: 'ja' | 'en' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/${lang}`} className="text-blue-600 hover:underline mb-8 inline-block">← Back</Link>
        <h1 className="text-3xl font-bold mb-8">Terms of Service / 利用規約</h1>
        <div className="prose prose-blue max-w-none">
          {/* ここに英語と日本語の規約文を流し込みます */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">1. Agreement to Terms</h2>
            <p>English text here...</p>
            <p className="mt-2 text-gray-600">日本語のテキストがここに入ります...</p>
          </section>
        </div>
      </div>
    </div>
  )
}