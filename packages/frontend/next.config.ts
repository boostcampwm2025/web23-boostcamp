import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
