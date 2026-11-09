import type { Database } from "./types";

/** Helpers para acceder a las tablas del schema public. */
type PublicSchema = Database["public"];
type PublicTables = PublicSchema["Tables"];

/** Tipo fila de cada tabla (lo que devuelve SELECT). */
export type ContentBlock = PublicTables["content_blocks"]["Row"];
export type ContentBlockMetadata =
  PublicTables["content_blocks_metadata"]["Row"];
export type Translation = PublicTables["translations"]["Row"];
export type Language = PublicTables["languages"]["Row"];
export type Profile = PublicTables["profiles"]["Row"];

/** Helper generico para el cliente tipado al schema "public". */
export type SiteClient = import("@supabase/supabase-js").SupabaseClient<
  Database,
  "public"
>;
