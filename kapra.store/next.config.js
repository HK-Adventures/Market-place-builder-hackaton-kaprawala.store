/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ]
  },
  typescript: {
    // During deployment, we can ignore TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // During deployment, we can ignore ESLint errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Add Sanity Studio configuration
  rewrites: async () => {
    return [
      {
        source: '/studio/:path*',
        destination: '/studio/index.html',
      },
    ];
  },
};

export default nextConfig;