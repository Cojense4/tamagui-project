const { withTamagui } = require('@tamagui/next-plugin')

const tamaguiConfig = {
  config: './tamagui.config.ts',
  components: ['tamagui'],
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  disableExtraction: process.env.NODE_ENV === 'development',
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = withTamagui(nextConfig, tamaguiConfig)