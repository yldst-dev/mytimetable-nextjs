import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CSS 및 정적 파일 캐싱 최적화
  headers: async () => [
    {
      source: '/_next/static/css/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default nextConfig;
