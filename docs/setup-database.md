---

type: guide
status: active
created: 2026-11-09
tags: [supabase, database, setup, rpc, data]
---

# Setup de la base de datos (modo Supabase)

Este documento es el paso que falta entre "tengo un proyecto de Supabase" y
"el sitio anda". El script que hace todo el trabajo esta en la raiz del
template: **`setup-database.sql`**.

> Sin ejecutar ese SQL, el modo Supabase no funciona: la RPC `get_site_payload`
> no existe y el sitio no puede pedir datos.

---

## Que hace `setup-database.sql`

Un unico script, en este orden:

| #   | Objeto                                    | Tipo      | Que es                                                       |
| --- | ----------------------------------------- | --------- | ------------------------------------------------------------ |
| 1   | `languages`                               | tabla     | Catalogo de idiomas (`code`, `name`, `is_default`)           |
| 2   | `content_blocks`                          | tabla     | Catalogo de bloques: la `key` de cada seccion o proyecto     |
| 3   | `content_blocks_metadata`                 | tabla     | Datos **no** traducibles por bloque (JSONB)                  |
| 4   | `translations`                            | tabla     | Textos **traducibles** por bloque y por idioma (JSONB)       |
| 5   | `profiles`                                | tabla     | Perfil de usuario: `id` (FK a `auth.users`), `role`, `email` |
| 6   | `get_site_payload(p_lang, p_keys)`        | RPC       | Devuelve todo el contenido del sitio en una sola llamada     |
| 7   | `get_translation_by_key(block_key, lang)` | RPC       | Devuelve el contenido de un bloque puntual                   |
| 8   | `handle_new_user()` + trigger             | trigger   | Crea el `profiles` del usuario al registrarse                |
| 9   | RLS + policies                            | seguridad | `public_read_access` para lectura publica                    |

El script es **idempotente**: usa `CREATE TABLE IF NOT EXISTS`,
`CREATE OR REPLACE FUNCTION` y `ON CONFLICT DO NOTHING`. Se puede correr
mas de una vez sin romper nada.

### El schema es `public`

Todas las tablas y funciones se crean en el schema **`public`** (el default de
Postgres): el script no usa `CREATE SCHEMA` ni califica los nombres.

Eso es lo que espera el codigo: los tipos generados son del schema `public`
(`src/services/supabase/types/types.ts`) y el `supabase.rpc("get_site_payload")`
busca la funcion en `public`.

Si el proyecto quiere las tablas en otro schema (por ejemplo `portfolio`),
hay que **cambiar el SQL antes de correrlo** (calificar cada tabla) y
**regenerar los tipos** con `--schema portfolio`. El RPC tambien hay que
moverlo: si queda en `public` y las tablas en `portfolio`, el `SECURITY
INVOKER` de la funcion la hace fallar por permisos de schema.

### Las tablas en detalle

**`languages`** — los idiomas disponibles.

```sql
code        TEXT PRIMARY KEY   -- 'es', 'en'
name        TEXT NOT NULL
is_default  BOOLEAN
```

El script inserta `es` (default) y `en`.

**`content_blocks`** — el catalogo de bloques. Una fila por bloque de
contenido del sitio.

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
key         TEXT UNIQUE NOT NULL   -- 'section.hero', 'project.mi-proyecto'
owner       TEXT NOT NULL DEFAULT 'admin'
description TEXT
```

La `key` es el contrato con la app: es la que usa el RPC para armar los mapas
`content` y `metadata`.

**`translations`** — los textos traducibles. Una fila por bloque **por idioma**.

```sql
id         UUID PRIMARY KEY
block_id   UUID REFERENCES content_blocks(id) ON DELETE CASCADE
lang_code  TEXT REFERENCES languages(code) ON DELETE CASCADE
content    JSONB NOT NULL DEFAULT '{}'
UNIQUE(block_id, lang_code)
```

**`content_blocks_metadata`** — los datos que no se traducen (imagenes, links,
categorias, flags). Una fila por bloque.

```sql
id       UUID PRIMARY KEY
block_id UUID UNIQUE NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE
content  JSONB NOT NULL DEFAULT '{}'
```

**`profiles`** — el rol del usuario. Se usa para el guard de admin.

```sql
id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
username JSONB
role     TEXT DEFAULT 'client'   -- 'client' | 'admin'
email    VARCHAR
```

### La RPC `get_site_payload`

Es la unica funcion que la app usa para leer datos del sitio.

```sql
get_site_payload(p_lang TEXT, p_keys TEXT[] DEFAULT NULL) RETURNS JSONB
```

Devuelve los dos mapas del contrato de datos, indexados por `key` de bloque:

```json
{
  "content":  { "section.hero": {...}, "project.mi-proyecto": {...} },
  "metadata": { "section.hero": {...}, "general.contacts": {...} }
}
```

- `content` se arma con `content_blocks` + `translations`, filtrando por
  `t.lang_code = p_lang`.
- `metadata` se arma con `content_blocks` + `content_blocks_metadata`, sin
  filtro de idioma (la metadata no se traduce).
- `p_keys` es opcional: si se pasa, limita el resultado a esas keys. La app
  **no** lo usa: llama siempre con el solo `p_lang`.

La funcion es `SECURITY INVOKER` (no `DEFINER`), asi que respeta las policies
de RLS de las tablas subyacentes.

### La RPC `get_translation_by_key`

```sql
get_translation_by_key(block_key TEXT, lang TEXT) RETURNS JSONB
```

Devuelve el `content` de un bloque puntual. **La app no la usa**: existe para
un panel de admin o para pedir un bloque especifico. Si no la vas a usar, la
podes dejar: no molesta.

### El trigger `handle_new_user`

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Cada usuario que se registra (por email o por Google) recibe automaticamente
una fila en `profiles` con `role = 'client'`.

**Para dar permisos de admin a alguien**, hay que actualizar el rol a mano
desde el SQL Editor o desde el panel de Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

El trigger **nunca** asigna `admin` automaticamente: es deliberado.

### Las policies

```sql
CREATE POLICY "public_read_access" ON content_blocks          FOR SELECT USING (true);
CREATE POLICY "public_read_access" ON content_blocks_metadata FOR SELECT USING (true);
CREATE POLICY "public_read_access" ON profiles                FOR SELECT USING (true);
CREATE POLICY "public_read_access" ON translations            FOR SELECT USING (true);
```

Se habilita RLS en las cinco tablas. Las cuatro policies de lectura son
publicas: cualquiera puede leer el contenido del sitio con la publishable key.
No hay policies de escritura: el contenido se escribe desde el panel de
Supabase o desde un panel admin con la service role key.

> `profiles` es de lectura publica **con el `email` incluido**. Si un proyecto
> no necesita que el email sea legible sin sesion, conviene sacar el `email`
> de la tabla o restrictingla.

---

## Que necesitas antes de correrlo

| Variable                               | Para que sirve                                            |
| -------------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | La URL del proyecto (`https://<ref>.supabase.co`)         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | La publishable key (la anon key nueva)                    |
| `DATA_SOURCE=supabase`                 | Fuerza el modo Supabase en vez de usar los JSON estaticos |

En `.env.local`:

```bash
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Sin `DATA_SOURCE`, `resolveDataSource()` (`src/services/env.ts:102`) usa
Supabase **solo si** las dos credenciales estan cargadas, y si no, cae al JSON
estatico. Ver la decision `docs/decisions/data-source-switch.md`.

Las dos variables se leen a traves de `supabaseEnv` (`src/services/env.ts:44`),
que son getters: si falta alguna, tiran `MissingEnvError` en el momento del
uso, no al importar el modulo.

---

## Como ejecutarlo

### Opcion A — Supabase Dashboard (la que esta pensada para el template)

1. Abrir el proyecto en <https://supabase.com/dashboard>.
2. Ir a **SQL Editor** en el menu lateral.
3. **New query**.
4. Pegar el contenido completo de `setup-database.sql`.
5. **Run**.

El script tarda un par de segundos. Si no tira error, salio bien.

Alternativa: subir el archivo con el boton de upload del SQL Editor, que
acepta `.sql` directo.

### Opcion B — CLI de Supabase (`supabase db push`)

El template **no** trae un directorio `supabase/` con migraciones, asi que
`db push` no funciona tal cual. Para usar la CLI hay que inicializar el
proyecto primero:

```bash
bunx supabase init          # crea supabase/config.toml y supabase/migrations/
bunx supabase link --project-ref <PROJECT_REF>
```

Despues, copiar el SQL a una migracion con timestamp:

```bash
mkdir -p supabase/migrations
cp setup-database.sql supabase/migrations/<timestamp>_setup_database.sql
bunx supabase db push
```

> El timestamp tiene que ser `YYYYMMDDHHMMSS`. Es lo que ordena las
> migraciones, asi que no uses fechas del pasado.

La CLI pide la password de la DB la primera vez. Se puede(setear con
`SUPABASE_DB_PASSWORD` en vez de tipearla.

### Verificacion

En el SQL Editor del proyecto:

```sql
-- 1) Las tablas existen
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 2) La RPC existe
SELECT proname FROM pg_proc WHERE proname LIKE 'get_site%';

-- 3) La RPC devuelve el payload
SELECT get_site_payload('es');
```

El paso 3 tiene que devolver un JSON con dos claves, `content` y `metadata`.
Con la base vacia devuelve `{"content": {}, "metadata": {}}`: eso esta bien,
significa que la RPC anda pero todavia no hay contenido cargado.

Un chequeo mas completo, que valida el.shape:

```sql
SELECT jsonb_object_keys(get_site_payload('es'));
```

---

## La relacion con `src/services/data/site.ts`

La app no consulta las tablas directamente: llama a la RPC.

```ts
// src/services/data/site.ts:189-203
const fetchFromSupabase = async (lang: string): Promise<SitePayload> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_site_payload", {
    p_lang: lang,
  });
  if (error) throw new Error(`[site] RPC error: ${error.message}`);
  ...
};
```

**Un solo argumento**: `p_lang`. `p_keys` no se pasa, asi que la RPC devuelve
todos los bloques.

El `createClient()` de `src/services/supabase/server.ts` usa `cookies()` de
Next: es el cliente de servidor, para Server Components y Route Handlers.

Despues de la RPC, el payload pasa por `parsePayload()` (`site.ts:109`), que
valida cada bloque contra su schema de Zod. Si falta un bloque obligatorio,
`getSiteData` lanza `[site] Missing content for "section.hero"`. Si el shape
esta mal, lanza `[site] Invalid content for "section.hero": <mensaje>`.

### Que bloques espera la app

Los bloques **con schema Zod** (obligatorios, si faltan la app explota):

| Content            | Metadata           |
| ------------------ | ------------------ |
| `section.hero`     | `section.hero`     |
| `section.navbar`   | `general.contacts` |
| `section.skills`   | `section.skills`   |
| `section.aboutme`  | `section.aboutme`  |
| `section.projects` |                    |
| `section.contact`  |                    |
| `section.footer`   |                    |

Los bloques de **proyecto** son dinamicos: cualquier key con prefijo
`project.` se valida con `ProjectItemSchema` y `ProjectsMetadataSchema`, y
`pickProjects()` los ordena alfabeticamente por slug.

---

## Cargar el contenido (despues del setup)

El orden importa por las foreign keys.

**Paso 1 — el catalogo de bloques.** Una fila por bloque, en
`content_blocks`:

```sql
INSERT INTO content_blocks (key, description) VALUES
  ('section.hero',      'Hero de la landing'),
  ('section.navbar',    'Links del nav'),
  ('section.skills',    'Stack tecnologico'),
  ('section.aboutme',   'Seccion sobre mi'),
  ('section.projects',  'Grilla de proyectos'),
  ('section.contact',   'Formulario de contacto'),
  ('section.footer',    'Footer'),
  ('general.contacts',  'Links de contacto globales'),
  ('project.atlas',     'Proyecto Atlas');
```

> `general.contacts` va tambien en `content_blocks`, aunque solo tenga
> metadata: el RPC arma los dos mapas desde esa tabla.

**Paso 2 — la metadata** (no traducible). Una fila por bloque:

```sql
INSERT INTO content_blocks_metadata (block_id, content)
SELECT id, '{"image_key":"images/profile.png"}'::jsonb
FROM content_blocks WHERE key = 'section.hero';
```

**Paso 3 — las traducciones.** Una fila por bloque **por idioma**:

```sql
INSERT INTO translations (block_id, lang_code, content)
SELECT id, 'es', '{"data":{"title":"Construyo productos digitales"}}'::jsonb
FROM content_blocks WHERE key = 'section.hero';

INSERT INTO translations (block_id, lang_code, content)
SELECT id, 'en', '{"data":{"title":"I build digital products"}}'::jsonb
FROM content_blocks WHERE key = 'section.hero';
```

### El shape del JSONB importa

El `content` de `translations` tiene que matchear **exactamente** el schema
Zod de `src/components/schemas.ts`. Un campo mal nombrado hace fallar la
validacion en runtime (TypeScript no se entera: los JSONB no estan tipados).

Dos trampas concreteas:

1. **La metadata usa snake_case**, porque es el shape de la base:
   `link_github`, `is_relevant`. Si en el schema Zod pones `linkGithub`, la
   `safeParse` falla en runtime.
2. **Cada idioma se valida por separado.** Si `section.hero` esta en `es` pero
   no en `en`, la app funciona en español y explota en ingles.

### Como se ve el shape esperado

El `site.es.json` del modo estatico tiene la misma forma. Es la referencia mas
fiable para saber que JSONB escribir:

```bash
cat src/services/data/static/site.es.json
```

---

## Los JSON estaticos NO se borran

Al pasar a modo Supabase, **no borres `src/services/data/static/`**.

Son el fallback: sin credenciales cargadas, `resolveDataSource()` devuelve
`static` y el template arranca con los JSON de ejemplo. Un proyecto que los
borra pierde la capacidad de arrancar sin base de datos (y con ella, el modo
CI y el preview de Vercel sin variables de entorno).

---

## Troubleshooting

### `RPC error: function get_site_payload does not exist`

La RPC no esta creada. Causas, en orden de probabilidad:

1. **No corriste el SQL.** Corrolo en el SQL Editor.
2. **Lo corriste en otro proyecto.** Verificá que `NEXT_PUBLIC_SUPABASE_URL`
   apunte al proyecto donde corriste el SQL.
3. **El SQL fallo a mitad de camino.** El SQL Editor muestra el error en rojo
   abajo. Volve a correrlo completo: es idempotente.
4. **La funcion quedo en otro schema.** El script la crea en `public`. Si
   moviste el RPC a otro schema, la app no lo encuentra: `supabase.rpc()`
   busca en `public` por defecto.

Para verificar desde el dashboard:

```sql
SELECT proname, pronamespace::regnamespace
FROM pg_proc WHERE proname = 'get_site_payload';
```

### `permission denied for table content_blocks`

Las policies no se aplicaron, o el rol que llama no tiene permiso de lectura.

Verificar que RLS esta habilitado y que las policies existen:

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public';
```

Si falta una policy, se agrega a mano:

```sql
CREATE POLICY "public_read_access" ON translations FOR SELECT USING (true);
```

Si el problema es que la consulta se hace desde un servicio con la
`service_role` key y la RLS esta activa: la `service_role` key **bypasea** RLS,
asi que ese no es el problema. El problema real es una policy ausente o mal
definida.

### `[site] Missing content for "section.hero"`

La RPC anda pero falta un bloque. Opciones:

1. Falta la fila en `content_blocks` para esa key.
2. Falta la traduccion para el idioma que se esta pidiendo.
3. El `content` de la traduccion esta en `content_blocks_metadata` en vez de en
   `translations` (o al reves). La separacion es estricta: texto va a
   `translations`, dato no traducible va a `content_blocks_metadata`.

Chequeo rapido:

```sql
SELECT cb.key, t.lang_code IS NOT NULL AS tiene_es, m.id IS NOT NULL AS tiene_meta
FROM content_blocks cb
LEFT JOIN translations t ON t.block_id = cb.id AND t.lang_code = 'es'
LEFT JOIN content_blocks_metadata m ON m.block_id = cb.id
ORDER BY cb.key;
```

### `[site] Invalid content for "section.hero": <mensaje>`

El bloque existe pero no matchea el schema Zod. Casi siempre es:

- un nombre de campo en camelCase donde el schema espera snake_case
- un campo obligatorio que falta
- un tipo distinto (string donde va boolean, etc.)

El mensaje de Zod dice exactamente que campo y que se esperaba.

### El sitio arranca pero no cambia de idioma

La RPC se esta llamando con un `lang_code` para el que no hay traducciones.
El RPC devuelve `content` sin la key y `parsePayload` explota. O el problema es
el cache: en produccion `getSiteData` cachea 1 hora con el tag `site:<lang>`.
Despues de cargar contenido nuevo:

```ts
revalidateTag("site:es");
```

En desarrollo no hay cache: se lee siempre de la fuente.

### `MissingEnvError: NEXT_PUBLIC_SUPABASE_URL`

Falta la variable. Recordar que el acceso es **estatico**: `process.env.X`
literal, nunca `process.env[name]`. Y que las variables `NEXT_PUBLIC_` se
leen en el cliente, asi que el bundle del navegador las lleva incrustadas:
cambiar una requiere **reiniciar el dev server**, no alcanza con recargar.

---

## Archivos relacionados

| Archivo                                     | Rol                                            |
| ------------------------------------------- | ---------------------------------------------- |
| `setup-database.sql`                        | El script. Vive en la raiz del repo            |
| `src/services/data/site.ts`                 | Llama a la RPC y valida el payload             |
| `src/services/env.ts`                       | `resolveDataSource()` y `supabaseEnv`          |
| `src/services/supabase/server.ts`           | Cliente de Supabase para el servidor           |
| `src/components/schemas.ts`                 | Los schemas Zod: el shape que hay que escribir |
| `src/services/data/static/site.<lang>.json` | La referencia del shape esperado               |
| `docs/data/README.md`                       | El contrato de datos                           |
| `docs/decisions/data-source-switch.md`      | Por que existen los dos modos                  |
