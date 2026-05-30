import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'xiuoposjwqrlwwxfeqod.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ngaturin.web.id',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/transactions",
        destination: "/dashboard/transactions",
        permanent: true,
      },
      {
        source: "/transaksi",
        destination: "/dashboard/transactions",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
