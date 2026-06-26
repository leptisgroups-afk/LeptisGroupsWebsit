/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8001';

const nextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/offers',
        destination: '/events',
        permanent: true,
      },
      {
        source: '/offers/:path*',
        destination: '/events/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${BACKEND_URL}/media/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
