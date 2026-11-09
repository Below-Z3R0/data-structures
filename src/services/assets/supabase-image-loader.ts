import type { ImageLoaderProps } from "next/image";
import { isSupabaseConfigured, supabaseEnv } from "@/services/env";

export default function supabaseImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  const cleanSrc = src.replace(/^\//, ""); // quita el leading slash

  if (cleanSrc.startsWith("http")) {
    const url = new URL(cleanSrc);
    url.searchParams.set("width", width.toString());
    url.searchParams.set("quality", (quality ?? 75).toString());
    return url.href;
  }

  // Sin Supabase configurado (modo estatico) no hay Storage donde servir la
  // imagen. Se devuelve la ruta local de /public con los parametros de ancho
  // y calidad: el servidor de archivos estaticos los ignora, pero Next los
  // necesita para generar un srcset con entradas distintas por ancho.
  if (!isSupabaseConfigured()) {
    return `/${cleanSrc}?w=${width}&q=${quality ?? 75}`;
  }

  return `${supabaseEnv.url}/storage/v1/object/public/project-images/${cleanSrc}?width=${width}&quality=${quality ?? 75}`;
}
