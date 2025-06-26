/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Opsi ini penting untuk memperbolehkan Next.js memproses SVG
    // melalui komponen <Image>.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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