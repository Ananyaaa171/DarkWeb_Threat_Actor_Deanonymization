/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080',
  },

  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;