import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化
  images: {
    domains: ['picsum.photos'],
    formats: ['image/webp', 'image/avif'],
  }
};

export default nextConfig;
