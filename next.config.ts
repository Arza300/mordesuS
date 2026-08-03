import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Next 15.5+ — not always typed; prevents FormData truncation
    ...({
      proxyClientMaxBodySize: "100mb",
      middlewareClientMaxBodySize: "100mb",
    } as object),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
