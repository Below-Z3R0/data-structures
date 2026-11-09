import { z } from "zod";
import {
  type HeroContent,
  HeroContentSchema,
  type HeroMetadata,
  HeroMetadataSchema,
  type PilaContent,
  PilaContentSchema,
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

/** Schemas de los bloques de contenido conocidos. */
const CONTENT_SCHEMAS = {
  "section.hero": HeroContentSchema,
  "section.pila": PilaContentSchema,
} as const;

/** Schemas de los bloques de metadata conocidos. */
const METADATA_SCHEMAS = {
  "section.hero": HeroMetadataSchema,
} as const;

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

/** Payload crudo tal como viene del JSON estatico. */
type RawPayload = {
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

// =============================================================================
// VALIDACION
// =============================================================================

/**
 * Valida el payload contra los schemas de Zod.
 *
 * Si un bloque no cumple el schema, `getSiteData` lanza un error con la
 * key y el mensaje del problema: falla ruidoso en vez de renderizar datos
 * rotos.
 */
const parsePayload = (raw: RawPayload): SitePayload => {
  const content: Record<string, unknown> = {};
  const metadata: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(CONTENT_SCHEMAS)) {
    const value = raw.content?.[key];
    if (value === undefined) {
      throw new Error(`[site] Missing content for "${key}"`);
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      console.error(`[site] Content invalid for "${key}":`, result.error);
      throw new Error(
        `[site] Invalid content for "${key}": ${result.error.issues[0]?.message}`,
      );
    }
    content[key] = result.data;
  }

  for (const [key, schema] of Object.entries(METADATA_SCHEMAS)) {
    const value = raw.metadata?.[key];
    if (value === undefined) {
      throw new Error(`[site] Missing metadata for "${key}"`);
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      console.error(`[site] Metadata invalid for "${key}":`, result.error);
      throw new Error(
        `[site] Invalid metadata for "${key}": ${result.error.issues[0]?.message}`,
      );
    }
    metadata[key] = result.data;
  }

  return { content, metadata } as SitePayload;
};

// =============================================================================
// FUENTE DE DATOS
// =============================================================================

/** Payloads estaticos, indexados por idioma. */
const STATIC_PAYLOADS: Record<string, RawPayload> = {
  en: en as unknown as RawPayload,
  es: es as unknown as RawPayload,
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
  return parsePayload(payload);
};

/** Schema del payload completo. */
export const SitePayloadSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()),
});
