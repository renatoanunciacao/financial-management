import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignora todos os erros de ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
