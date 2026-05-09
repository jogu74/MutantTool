import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: true,
  experimental: {
    useWasmBinary: true
  }
};

export default nextConfig;
