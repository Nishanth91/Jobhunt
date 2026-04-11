/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix pdf-parse loading test files
    if (isServer) {
      config.resolve.alias['canvas'] = false;
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
};

export default nextConfig;
