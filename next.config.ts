import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    allowedOrigins: [
      'easy-japanese.shizuoka-connect.com',
      'https://easy-japanese.shizuoka-connect.com'
    ]
  },
  // ▼▼▼ ここからセキュリティヘッダーの設定を追加 ▼▼▼
  async headers() {
    return [
      {
        source: '/(.*)', // サイト内のすべてのページに適用
        headers: [
          {
            // 他のサイトの iframe 内でこのサイトを表示させない（クリックジャッキング対策）
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // ブラウザにファイルのMIMEタイプを推測させない
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // HTTPS通信を強制する（中間者攻撃対策）
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // 別のサイトへ移動する際に余計な情報を送らない
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