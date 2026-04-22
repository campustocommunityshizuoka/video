import type { NextConfig } from "next";

// ★追加：Nihon Work Base専用の強力なCSP（セキュリティバリア）の設定
// 許可する外部サービス（Stripe, Vimeo, Supabase）を明記しています
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co https://i.vimeocdn.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://checkout.stripe.com https://billing.stripe.com;
  frame-ancestors 'none';
  frame-src 'self' https://player.vimeo.com https://js.stripe.com https://hooks.stripe.com;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  serverActions: {
    allowedOrigins: [
      'easy-japanese.shizuoka-connect.com',
      'https://easy-japanese.shizuoka-connect.com'
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // CSPヘッダーの適用（-25点の解消）
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            // クリックジャッキング対策（-20点の解消）
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // MIMEタイプの偽装防止（-5点の解消）
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // HTTPSの強制
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // 情報漏洩の防止
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // 古いブラウザ用のXSS対策
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          }
        ],
      },
    ];
  },
};

export default nextConfig;