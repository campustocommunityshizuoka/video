import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    allowedOrigins: ['easy-japanese.shizuoka-connect.com']
  }
};

export default nextConfig;