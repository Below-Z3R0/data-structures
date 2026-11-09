import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Loader custom para servir las imagenes desde Supabase Storage con
    // transformaciones de ancho y calidad.
    // Ver src/services/assets/supabase-image-loader.ts
    loader: "custom",
    loaderFile: "./src/services/assets/supabase-image-loader.ts",
  },
};

export default nextConfig;
