import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for "Module not found: Can't resolve 'async_hooks'"
    // This module is Node.js specific and not available in the browser.
    // Providing a fallback prevents the error when Webpack tries to bundle it for the client.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false, // Tells Webpack to provide an empty module or ignore it on the client
      };
    }

    return config;
  },
};

export default nextConfig;
