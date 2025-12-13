import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Importante para Render - optimiza el build
  eslint: {
    ignoreDuringBuilds: true, // Evita que errores de ESLint detengan el build
  },
  typescript: {
    ignoreBuildErrors: false, // Mantén esto en false para detectar errores de TypeScript
  },
};

export default nextConfig;
