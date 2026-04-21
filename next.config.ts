import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Logos exposants jusqu'à 2 Mo (cf. app/exposant/profil/logo-actions.ts).
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
