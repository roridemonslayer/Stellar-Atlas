/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  // IMPORTANT: If deploying to https://yourusername.github.io/repo-name
  // Uncomment the line below and replace 'repo-name' with your repository name:
  // basePath: '/Stellar-Atlas',
}

export default nextConfig