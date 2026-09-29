import type { NextConfig } from "next";

// Security headers on every page: no framing by other sites (clickjacking), no MIME sniffing,
// no full URLs leaked to other sites, and camera/mic/location off.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Shared hosting (Hostinger) limits how many processes a build may start: Turbopack's CSS
  // worker was killed there ("node process exited before we could connect"). `npm run build`
  // uses webpack, and these keep the build in as few processes as possible.
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
  },
  images: {
    // Only our own API (it was "any https host", which made /_next/image an open image proxy)
    remotePatterns: [
      { protocol: 'https', hostname: 'api.ebanzo.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
