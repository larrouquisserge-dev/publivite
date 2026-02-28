import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mode standalone pour Docker (optimise la taille de l'image)
  output: "standalone",
  
  // Désactiver la télémétrie en production
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  experimental: {
    // Options expérimentales si nécessaire
  },
};

export default nextConfig;
