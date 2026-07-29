import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint runs separately in CI. Don't block Vercel production builds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
