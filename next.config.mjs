/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["172.18.0.1"],
  serverExternalPackages: ["@prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
