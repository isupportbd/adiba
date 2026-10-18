/** @type {import('next').NextConfig} */

// The app's own public URL — used by the image optimizer to fetch MinIO-backed media.
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
let appHost = "localhost";
try {
  appHost = new URL(appUrl).hostname;
} catch {
  /* keep localhost */
}

const securityHeaders = [
  // সার্চ ইঞ্জিনকে সাইট ইনডেক্স করতে নিষেধ (privacy-critical)
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  // Docker-friendly standalone output (see Dockerfile).
  output: "standalone",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Sample placeholder artwork ships as inline SVG so the site works with zero setup.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [64, 96, 128, 192, 256, 384],
    remotePatterns: [
      // Same-origin media proxy (/api/media/...) that streams from MinIO.
      { protocol: "http", hostname: appHost, pathname: "/api/media/**" },
      { protocol: "https", hostname: appHost, pathname: "/api/media/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
