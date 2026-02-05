/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // ADD THIS LINE - enables static HTML export
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig