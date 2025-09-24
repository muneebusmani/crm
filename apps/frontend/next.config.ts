// import path from "node:path";
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // turbopack: {
  // root: path.join(__dirname, "../.."),
  // },
  experimental: {
    globalNotFound: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**', // UI Avatars API path
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Keep this as backup
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**', // Keep this as backup
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**', // Keep this as backup
      },
    ],
  },
};

export default nextConfig;
