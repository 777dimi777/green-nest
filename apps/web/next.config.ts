import type { NextConfig } from "next";

function getApiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return new URL(configured);
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL is required for production builds.");
  }
  return new URL("http://localhost:3001/api");
}

const api = getApiUrl();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: api.protocol.replace(":", "") as "http" | "https",
        hostname: api.hostname,
        port: api.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
