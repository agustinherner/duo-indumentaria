const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } = require("next/constants");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

// La tienda no arranca (ni compila) sin JWT_SECRET: sin ella no hay forma segura de firmar sesiones
module.exports = (phase) => {
  const needsSecret = [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER].includes(phase);
  if (needsSecret && !process.env.JWT_SECRET) {
    throw new Error(
      "Falta JWT_SECRET. Definila en .env con una clave larga y aleatoria " +
        '(por ejemplo: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))").'
    );
  }
  return nextConfig;
};
