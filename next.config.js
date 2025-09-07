const { withTamagui } = require('@tamagui/next-plugin')

const tamaguiConfig = {
  config: './tamagui.config.ts',
  components: ['@tamagui/core'],
  appDir: true,
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = withTamagui(nextConfig, tamaguiConfig)