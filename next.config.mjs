/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  typescript: {
    // Type checking is performed by CI
    ignoreBuildErrors: false,
  },
  // Output standalone for Docker deployment
  output: 'standalone',
};

export default nextConfig;
