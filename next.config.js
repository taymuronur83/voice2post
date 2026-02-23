/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  generateEtags: false, // Vercel'in videoyu eski haliyle (boş) hatırlamasını engeller
}

module.exports = nextConfig
