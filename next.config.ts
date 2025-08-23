import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境优化
  swcMinify: true,
  
  // 图片优化
  images: {
    domains: ['picsum.photos'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 实验性功能
  experimental: {
    // 启用App Router
    appDir: true,
  }
};

export default nextConfig;
