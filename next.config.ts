import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/djogenwmh/image/upload/**",
      },
    ],
    formats: ["image/webp"],
  },
};

export default nextConfig;
