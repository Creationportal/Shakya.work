import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {};

// In development we setup the dev platform so that we can use bindings
// (e.g. KV, R2, D1) and the runtime APIs (e.g. `caches`, `event.waitUntil`)
if (process.env.NODE_ENV === "development") {
  setupDevPlatform().catch(console.error);
}

export default nextConfig;
