import type {
  HeroContent,
  HeroMetadata,
  PilaContent,
} from "@/components/schemas";
import en from "./static/site.en.json";
import es from "./static/site.es.json";

// =============================================================================
// CONTRATO DE DATOS
// =============================================================================
// El sitio se alimenta de un unico payload con dos mapas:
//   - content:  textos traducibles, indexados por "section.<x>"
//   - metadata: datos no traducibles, con las mismas keys
//
// El origen es ESTATICO: los JSON de ./static/. No hay Supabase, ni
// credenciales, ni variables de entorno. El switch DATA_SOURCE del
// template desaparece porque solo hay una fuente posible.
// =============================================================================

export type SiteContent = {
  "section.hero": HeroContent;
  "section.pila": PilaContent;
};

export type SiteMetadata = {
  "section.hero": HeroMetadata;
};

export type SitePayload = {
  content: SiteContent;
  metadata: SiteMetadata;
};

// =============================================================================
// FUENTE DE DATOS
// =============================================================================

/** Payloads estaticos, indexados por idioma. */
const STATIC_PAYLOADS: Record<string, SitePayload> = {
  en: en,
  es: es,
};

const DEFAULT_LANG = "es";

/**
 * Devuelve el payload del sitio para el idioma pedido.
 *
 * Los datos son locales (JSON estaticos), no hay red ni cache: el
 * payload es chico y ya esta en el bundle del servidor.
 */
export const getSiteData = async (
  lang: string = DEFAULT_LANG,
): Promise<SitePayload> => {
  const payload = STATIC_PAYLOADS[lang] ?? STATIC_PAYLOADS[DEFAULT_LANG];
  return payload;
};
