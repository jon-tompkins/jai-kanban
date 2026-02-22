import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/jai-kanban',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
