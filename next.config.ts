// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    allowedOrigins: [
      'easy-japanese.shizuoka-connect.com',
      'https://easy-japanese.shizuoka-connect.com' // ★プロトコル付きを追加
    ]
  }
};

export default nextConfig;