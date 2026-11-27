import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // шрифти й логотип для OG-картинок читаються з диска (lib/og.tsx) — без цього
  // Vercel не кладе їх у функцію, і всі /opengraph-image падали з ENOENT (500)
  outputFileTracingIncludes: { "/**": ["./assets/og/**/*"] },
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
