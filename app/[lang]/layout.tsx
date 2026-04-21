import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
//@ts-ignore
import "../globals.css";
import { getDictionary } from '@/utils/get-dictionary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ★ 修正1：Promise<{ lang: string }> に変更
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  // ★ ここで 'ja' | 'en' 型として扱うように指定（as 構文）
  const dict = await getDictionary(lang as 'ja' | 'en');
  
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,

    icons: {
      icon: '/icon.png',
      apple: '/apple-icon.png',
    },
    openGraph: {
      images: [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
        }
      ],
    }
  };
}

// ★ 修正2：Promise<{ lang: string }> に変更
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  
  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

