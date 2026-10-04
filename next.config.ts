import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // старі адреси проєктів
  async redirects() {
    return [{ source: "/proyekty/kryt", destination: "/proyekty/leleki-shkola", permanent: true }];
  },
  images: {
    // зображення з DatoCMS
    remotePatterns: [{ protocol: "https", hostname: "www.datocms-assets.com" }],
  },
};

export default nextConfig;
