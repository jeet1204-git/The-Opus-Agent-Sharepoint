import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app folder (a stray lockfile in $HOME
  // otherwise confuses Turbopack's root inference).
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zjflecpcvlztlkpabveq.supabase.co',
      },
    ],
  },
};

export default nextConfig;
