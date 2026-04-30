import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
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
