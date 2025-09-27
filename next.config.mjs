/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove output: 'export' for Netlify deployment
  trailingSlash: false,
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig
