/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow images from local uploads folder
  images: {
    domains: ['localhost'],
  },
  // Needed for better-sqlite3 on server
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
}

module.exports = nextConfig
