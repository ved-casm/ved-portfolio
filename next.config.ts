import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serve AVIF first (smallest at the same quality), WebP as the fallback
  images: { formats: ["image/avif", "image/webp"] },
  // the home page used to live at /ved
  async redirects() {
    return [{ source: "/ved", destination: "/", permanent: true }];
  },
};

export default nextConfig;
