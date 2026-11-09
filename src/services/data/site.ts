import { unstable_cache } from "next/cache";
import { z } from "zod";
import {
  type AboutMeContent,
  AboutMeContentSchema,
  type AboutMeMetadata,
  AboutMeMetadataSchema,
  type ContactContent,
  ContactContentSchema,
  type FooterContent,
  FooterContentSchema,
  type GeneralContacts,
  GeneralContactsSchema,
  type HeroContent,
  HeroContentSchema,
  type HeroMetadata,
  HeroMetadataSchema,
  type NavbarContent,
  NavbarContentSchema,
  type ProjectItem,
  ProjectItemSchema,
  type ProjectsContent,
  ProjectsContentSchema,
  type ProjectsMetadata,
  ProjectsMetadataSchema,
  type SkillsContent,
  SkillsContentSchema,
  type SkillsMetadata,
  SkillsMetadataSchema,
} from "@/components/schemas";
import { resolveDataSource } from "@/services/env";
import { createClient } from "@/services/supabase/server";
import en from "./static/site.en.json";
import es from "./static/site.es.json";

// =============================================================================
// CONTRATO DE DATOS
// =============================================================================
// El sitio se alimenta de un unico payload con dos mapas:
//   - content:  textos traducibles, indexados por "section.<x>" y "project.<slug>"
//   - metadata: datos no traducibles, con las mismas keys
//
// Los dos modos de datos (Supabase y estatico) devuelven EXACTAMENTE esta
// forma, asi que los componentes no saben de donde salieron los datos.
// =============================================================================

/** Prefijo de las keys que representan un proyecto. */
export const PROJECT_KEY_PREFIX = "project.";

/** Schemas de los bloques de contenido conocidos. */
const CONTENT_SCHEMAS = {
  "section.hero": HeroContentSchema,
  "section.navbar": NavbarContentSchema,
  "section.skills": SkillsContentSchema,
  "section.aboutme": AboutMeContentSchema,
  "section.projects": ProjectsContentSchema,
  "section.contact": ContactContentSchema,
  "section.footer": FooterContentSchema,
} as const;

/** Schemas de los bloques de metadata conocidos. */
const METADATA_SCHEMAS = {
  "section.hero": HeroMetadataSchema,
  "general.contacts": GeneralContactsSchema,
  "section.skills": SkillsMetadataSchema,
  "section.aboutme": AboutMeMetadataSchema,
} as const;

export type SiteContent = {
  "section.hero": HeroContent;
  "section.navbar": NavbarContent;
  "section.skills": SkillsContent;
  "section.aboutme": AboutMeContent;
  "section.projects": ProjectsContent;
  "section.contact": ContactContent;
  "section.footer": FooterContent;
} & { [key: `project.${string}`]: ProjectItem };

export type SiteMetadata = {
  "section.hero": HeroMetadata;
  "general.contacts": GeneralContacts;
  "section.skills": SkillsMetadata;
  "section.aboutme": AboutMeMetadata;
} & { [key: `project.${string}`]: ProjectsMetadata };

export type SitePayload = {
  content: SiteContent;
  metadata: SiteMetadata;
};

/** Payload crudo tal como viene de Supabase o del JSON estatico. */
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
 * - Las keys conocidas ("section.*", "general.*") son obligatorias y se
 *   validan con su schema.
 * - Las keys "project.<slug>" se validan con el schema de proyecto.
 * - Cualquier otra key se ignora: puede ser un bloque del panel admin.
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

  for (const [key, value] of Object.entries(raw.content ?? {})) {
    if (key in CONTENT_SCHEMAS) continue;
    if (!key.startsWith(PROJECT_KEY_PREFIX)) continue;
    const result = ProjectItemSchema.safeParse(value);
    if (!result.success) {
      console.error(`[site] Content invalid for "${key}":`, result.error);
      throw new Error(
        `[site] Invalid content for "${key}": ${result.error.issues[0]?.message}`,
      );
    }
    content[key] = result.data;
  }

  for (const [key, value] of Object.entries(raw.metadata ?? {})) {
    if (key in METADATA_SCHEMAS) continue;
    if (!key.startsWith(PROJECT_KEY_PREFIX)) continue;
    const result = ProjectsMetadataSchema.safeParse(value);
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
// FUENTES DE DATOS
// =============================================================================

/** Payloads estaticos de ejemplo, indexados por idioma. */
const STATIC_PAYLOADS: Record<string, RawPayload> = {
  en: en as unknown as RawPayload,
  es: es as unknown as RawPayload,
};

const DEFAULT_LANG = "es";

const fetchFromStatic = async (lang: string): Promise<SitePayload> => {
  const payload = STATIC_PAYLOADS[lang] ?? STATIC_PAYLOADS[DEFAULT_LANG];
  return parsePayload(payload);
};

const fetchFromSupabase = async (lang: string): Promise<SitePayload> => {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_site_payload", {
    p_lang: lang,
  });
  if (error) throw new Error(`[site] RPC error: ${error.message}`);

  const payload = data as { content?: unknown; metadata?: unknown } | null;

  return parsePayload({
    content: (payload?.content ?? {}) as Record<string, unknown>,
    metadata: (payload?.metadata ?? {}) as Record<string, unknown>,
  });
};

// =============================================================================
// API PUBLICA
// =============================================================================

/**
 * Devuelve el payload del sitio para el idioma pedido.
 *
 * En produccion cachea 1 hora con revalidateTag('site:<lang>') para invalidar.
 */
export const getSiteData = async (
  lang: string = DEFAULT_LANG,
): Promise<SitePayload> => {
  const source = resolveDataSource();
  const fetcher = source === "supabase" ? fetchFromSupabase : fetchFromStatic;

  // En desarrollo, siempre ir a la fuente (sin cache).
  // En produccion, cachear 1 hora con revalidateTag('site:<lang>') para invalidar.
  if (process.env.NODE_ENV !== "production") {
    return fetcher(lang);
  }

  return unstable_cache(
    async () => fetcher(lang),
    ["site-payload", lang, source],
    {
      revalidate: 3600,
      tags: [`site:${lang}`],
    },
  )();
};

/**
 * Convierte los bloques "project.<slug>" del payload en la lista que espera
 * el componente ProjectsSection. El orden es alfabetico por slug.
 */
export const pickProjects = (payload: SitePayload) => {
  const slugs = Object.keys(payload.content)
    .filter((key) => key.startsWith(PROJECT_KEY_PREFIX))
    .sort();

  return slugs.map((key, index) => {
    const meta = payload.metadata[key as `project.${string}`];
    if (!meta) {
      throw new Error(`[site] Missing metadata for "${key}"`);
    }
    return {
      key: index + 1,
      data: payload.content[key as `project.${string}`],
      meta,
    };
  });
};

/** Tipos auxiliares reexportados para el orquestador. */
export type {
  AboutMeContent,
  ContactContent,
  FooterContent,
  GeneralContacts,
  HeroContent,
  HeroMetadata,
  NavbarContent,
  ProjectItem,
  ProjectsContent,
  ProjectsMetadata,
  SkillsContent,
  SkillsMetadata,
};

export const SitePayloadSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()),
});
