import { z } from "zod";
import {
  ColaContentSchema,
  HeroContentSchema,
  HeroMetadataSchema,
  PilaContentSchema,
} from "@/app/estructuras/schemas";
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
  "section.hero": z.infer<typeof HeroContentSchema>;
  "section.pila": z.infer<typeof PilaContentSchema>;
  "section.cola": z.infer<typeof ColaContentSchema>;
};

export type SiteMetadata = {
  "section.hero": z.infer<typeof HeroMetadataSchema>;
};

export type SitePayload = {
  content: SiteContent;
  metadata: SiteMetadata;
};

/**
 * Valida el payload estatico contra los schemas del dominio.
 *
 * El JSON importado por TypeScript pierde los literales (`id` entra como
 * `string`), asi que el parseo es lo que estrecha el catalogo al contrato
 * real del dominio y hace fallar el build si un id no existe.
 */
const SitePayloadSchema: z.ZodType<SitePayload> = z.object({
  content: z.object({
    "section.hero": HeroContentSchema,
    "section.pila": PilaContentSchema,
    "section.cola": ColaContentSchema,
  }),
  metadata: z.object({
    "section.hero": HeroMetadataSchema,
  }),
});

// =============================================================================
// FUENTE DE DATOS
// =============================================================================

/** Payloads estaticos, indexados por idioma. */
const STATIC_PAYLOADS: Record<string, SitePayload> = {
  en: SitePayloadSchema.parse(en),
  es: SitePayloadSchema.parse(es),
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
