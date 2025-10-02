import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/media/**',
      },
    ],
  },
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
