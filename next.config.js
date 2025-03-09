/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx']
      }
    };
    return config;
  },
}

module.exports = nextConfig 