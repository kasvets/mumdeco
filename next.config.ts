import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hclatgthoxuvdamrkakw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
