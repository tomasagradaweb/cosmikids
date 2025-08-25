import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.ap-south-1.amazonaws.com',
        pathname: '/western-chart/**',
      },
    ],
  },
  serverExternalPackages: ['puppeteer-core', 'puppeteer', 'canvas'],
};

export default nextConfig;
