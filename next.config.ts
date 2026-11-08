import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// Express + Socket.IO server (see ../server). Override with API_PROXY_TARGET.
const API_TARGET = (process.env.API_PROXY_TARGET || 'http://localhost:5000').replace(/\/$/, '');

export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    // Socket.IO requests `/socket.io/?EIO=…` — keep the trailing slash instead of redirecting it away.
    skipTrailingSlashRedirect: true,
    // In development the API runs on another port: proxy /api and /socket.io to it so
    // NEXT_PUBLIC_API_URL can stay empty (same as the old Vite dev-server proxy).
    async rewrites() {
      if (!isDev) return [];
      return [
        { source: '/api/:path*', destination: `${API_TARGET}/api/:path*` },
        { source: '/socket.io/', destination: `${API_TARGET}/socket.io/` },
        { source: '/socket.io/:path*', destination: `${API_TARGET}/socket.io/:path*` },
      ];
    },
  };
}
