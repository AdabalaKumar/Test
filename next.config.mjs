/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  serverExternalPackages: ['better-sqlite3'],
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
