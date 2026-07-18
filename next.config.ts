import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Elimina el header X-Powered-By en producción
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  // three.js y drei publican módulos que Next debe transpilar
  transpilePackages: ["three"],
};

export default nextConfig;
