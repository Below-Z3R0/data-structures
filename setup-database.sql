-- ================================================================
-- setup-database.sql
-- ================================================================
-- Script para configurar la base de datos en Supabase.
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- El contrato de datos del sitio (ver src/services/data/site.ts):
--   - content_blocks        : catalogo de bloques (key, owner, description)
--   - translations          : textos traducibles por idioma (content JSONB)
--   - content_blocks_metadata: datos NO traducibles por bloque (content JSONB)
--
-- La funcion get_site_payload(p_lang) devuelve los dos mapas juntos:
--   { content: { [block_key]: jsonb }, metadata: { [block_key]: jsonb } }
--
-- Las keys de bloque que espera la app:
--   content : section.hero, section.navbar, section.skills, section.aboutme,
--             section.projects, section.contact, section.footer, project.<slug>
--   metadata: section.hero, general.contacts, section.skills, section.aboutme,
--             project.<slug>
-- ================================================================


-- ================================================================
-- 1. LANGUAGES
-- ================================================================
CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  create_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE languages IS 'Idiomas disponibles en el sitio';

INSERT INTO languages (code, name, is_default) VALUES
  ('es', 'Espanol', true),
  ('en', 'English', false)
ON CONFLICT (code) DO NOTHING;


-- ================================================================
-- 2. CONTENT BLOCKS
-- ================================================================
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  owner TEXT NOT NULL DEFAULT 'admin',
  description TEXT,
  create_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE content_blocks IS 'Catalogo de bloques de contenido del sitio';
COMMENT ON COLUMN content_blocks.key IS 'Identificador unico (ej: section.hero, project.mi-proyecto)';


-- ================================================================
-- 3. CONTENT BLOCKS METADATA (datos no traducibles)
-- ================================================================
CREATE TABLE IF NOT EXISTS content_blocks_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID UNIQUE NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE content_blocks_metadata IS 'Datos no traducibles por bloque (imagenes, links, categorias)';


-- ================================================================
-- 4. TRANSLATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES content_blocks(id) ON DELETE CASCADE,
  lang_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(block_id, lang_code)
);

COMMENT ON TABLE translations IS 'Traducciones de cada content_block por idioma';

CREATE INDEX IF NOT EXISTS idx_translations_lang_block ON translations(lang_code, block_id);


-- ================================================================
-- 5. PROFILES
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username JSONB,
  role TEXT DEFAULT 'client',
  email VARCHAR,
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Perfiles de usuario. username es JSONB para strings multilingue';


-- ================================================================
-- 6. RPC: get_site_payload
-- ================================================================
-- Trae todo el contenido + metadata del sitio en una sola query.
-- Es la unica funcion que la app usa para leer datos del sitio.
-- ================================================================
CREATE OR REPLACE FUNCTION get_site_payload(p_lang TEXT, p_keys TEXT[] DEFAULT NULL)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT jsonb_build_object(
    'content', COALESCE((
      SELECT jsonb_object_agg(cb.key, t.content)
      FROM content_blocks cb
      JOIN translations t ON t.block_id = cb.id
      WHERE t.lang_code = p_lang
        AND (p_keys IS NULL OR cb.key = ANY(p_keys))
    ), '{}'::jsonb),
    'metadata', COALESCE((
      SELECT jsonb_object_agg(cb.key, m.content)
      FROM content_blocks cb
      JOIN content_blocks_metadata m ON m.block_id = cb.id
      WHERE p_keys IS NULL OR cb.key = ANY(p_keys)
    ), '{}'::jsonb)
  );
$$;

COMMENT ON FUNCTION get_site_payload IS 'Payload completo del sitio: { content, metadata } indexados por block key';


-- ================================================================
-- 7. RPC: get_translation_by_key
-- ================================================================
-- Devuelve el contenido de un bloque puntual para un idioma.
-- Util para el panel admin o para bloques especificos.
-- ================================================================
CREATE OR REPLACE FUNCTION get_translation_by_key(
  block_key TEXT,
  lang TEXT
) RETURNS JSONB AS $$
  SELECT t.content
  FROM translations t
  INNER JOIN content_blocks cb ON cb.id = t.block_id
  WHERE cb.key = block_key AND t.lang_code = lang
  LIMIT 1;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION get_translation_by_key IS 'Obtiene la traduccion de un bloque por key + idioma';


-- ================================================================
-- 8. TRIGGER: auto-crear perfil al registrarse
-- ================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    to_jsonb(COALESCE(NEW.raw_user_meta_data->>'display_name', 'Nuevo Usuario')),
    NEW.email,
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ================================================================
-- 9. RLS: Row Level Security
-- ================================================================
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_access" ON content_blocks FOR SELECT USING (true);
CREATE POLICY "public_read_access" ON content_blocks_metadata FOR SELECT USING (true);
CREATE POLICY "public_read_access" ON profiles FOR SELECT USING (true);
CREATE POLICY "public_read_access" ON translations FOR SELECT USING (true);

-- El RPC get_site_payload corre como invoker: respeta estas policies.
