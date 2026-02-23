/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mevcut ayarlarını SAKIN SİLME, sadece altına/içine bunları ekle
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Tüm dış kaynaklı videolara/resimlere izin verir
      },
    ],
  },
  // Videoların yüklenmesi için CORS ayarları (Gerekirse)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
