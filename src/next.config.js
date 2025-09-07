/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@tamagui/core',
    '@tamagui/config',
    '@tamagui/animations-react-native',
    'react-native-web',
    'react-native-svg'
  ],
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig