/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    SOLANA_NETWORK: "devnet",
    SERVER_URL: "http://localhost:3001",
  }
}

module.exports = nextConfig
