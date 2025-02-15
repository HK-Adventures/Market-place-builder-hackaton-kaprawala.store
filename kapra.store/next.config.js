// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'cdn.sanity.io',
//         pathname: '**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         pathname: '/**',
//       }
//     ]
//   },
//   typescript: {
//     // During deployment, we can ignore TypeScript errors
//     ignoreBuildErrors: true,
//   },
//   eslint: {
//     // During deployment, we can ignore ESLint errors
//     ignoreDuringBuilds: true,
//   },
//   // Simplify studio configuration
//   rewrites: async () => {
//     return [
//       {
//         source: '/studio',
//         destination: '/studio/[[...tool]]',
//       },
//       {
//         source: '/studio/:path*',
//         destination: '/studio/[[...tool]]',
//       }
//     ];
//   },
//   // Add proper CORS and security headers
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           {
//             key: 'X-Content-Type-Options',
//             value: 'nosniff',
//           },
//           {
//             key: 'X-Frame-Options',
//             value: 'DENY',
//           },
//           {
//             key: 'X-XSS-Protection',
//             value: '1; mode=block',
//           },
//         ],
//       },
//     ];
//   },
//   // Ensure pages are properly built
//   output: 'standalone',
// };

// export default nextConfig;

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
      },
    ],
  },
  typescript: {
    // Deployment ke waqt TypeScript errors ignore karega
    ignoreBuildErrors: true,
  },
  eslint: {
    // Deployment ke waqt ESLint errors ignore karega
    ignoreDuringBuilds: true,
  },
  // Studio page ke liye URL rewrites set karna
  async rewrites() {
    return [
      {
        source: '/studio',
        destination: '/studio/[[...tool]]',
      },
      {
        source: '/studio/:path*',
        destination: '/studio/[[...tool]]',
      },
    ];
  },
  // Security Headers Add Karna
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Next.js ko standalone mode mein build karna
  output: 'standalone',
};

export default nextConfig;

