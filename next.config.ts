import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the home page used to live at /ved
  async redirects() {
    return [{ source: "/ved", destination: "/", permanent: true }];
  },
};

export default nextConfig;
