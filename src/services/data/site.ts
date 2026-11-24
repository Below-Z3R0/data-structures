import { z } from "zod";
import {
  ColaContentSchema,
  HeroContentSchema,
  HeroMetadataSchema,
  PilaContentSchema,
} from "@/app/estructuras/schemas";
import en from "./static/site.en.json";
import es from "./static/site.es.json";

const SiteContentSchema = z.object({
  "section.hero": HeroContentSchema,
  "section.pila": PilaContentSchema,
  "section.cola": ColaContentSchema,
});

const SiteMetadataSchema = z.object({
  "section.hero": HeroMetadataSchema,
});

const SitePayloadSchema = z.object({
  content: SiteContentSchema,
  metadata: SiteMetadataSchema,
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type SiteMetadata = z.infer<typeof SiteMetadataSchema>;
export type SitePayload = z.infer<typeof SitePayloadSchema>;

/** Payloads estaticos por idioma, validados una vez al cargar el modulo. */
const STATIC_PAYLOADS: Record<string, SitePayload> = {
  en: SitePayloadSchema.parse(en),
  es: SitePayloadSchema.parse(es),
};

const DEFAULT_LANG = "es";

/** Devuelve el payload del idioma pedido; cae a es si no existe. */
export const getSiteData = async (
  lang: string = DEFAULT_LANG,
): Promise<SitePayload> =>
  STATIC_PAYLOADS[lang] ?? STATIC_PAYLOADS[DEFAULT_LANG];
