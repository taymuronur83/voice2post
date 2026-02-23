/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Videoların Vercel üzerinde görünmesini engelleyen önbelleği kırar
  generateEtags: false,
  // Dışarıdan gelen (GitHub) medyalar için optimizasyonu kapatır
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
