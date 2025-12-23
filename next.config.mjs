/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Opsi ini penting untuk memperbolehkan Next.js memproses SVG
    // melalui komponen <Image>.
    dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Optimisasi untuk production performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.thum.io',
        port: '',
        pathname: '/**',
      },
      {
        // Supabase Storage - untuk skills icons & project images
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Konfigurasi webpack untuk mengubah file .svg menjadi komponen React
  // Ini adalah cara yang paling direkomendasikan dan fleksibel.
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;