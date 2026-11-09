---

type: decision
status: active
created: 2026-11-09
tags: [data, supabase, static, architecture, decision]
---

# Decision: dos modos de datos con el mismo contrato

## Contexto

Un sitio como este tiene dos modos de vida posibles, y no son
mutuamente excluyentes:

1. **Prototipar y arrancar**: quiero ver el sitio andando, con contenido de
   ejemplo, sin crear un proyecto de Supabase, sin esperar los tiempos de una
   base de datos y sin tocar la red.
2. **Produccion**: quiero que el contenido sea editable sin deployar, que
   varios idiomas vivan en la base, y que el panel de admin pueda escribir.

La tentacion es resolver esto con dos implementaciones distintas: una que lee
JSON para el prototipo y otra que consulta Supabase para produccion. Esa
es exactamente la decision que produce el peor tipo de deuda: **el codigo de
la app queda atado a como seinel los datos**, y cambiar de modo implica
reescribir componentes.

El costo real aparece cuando el prototipo se vuelve producto: hay que
duplicar el shape de los datos, duplicar las validaciones, duplicar los
componentes que los renderizan, y mantener las dos copias sincronizadas.

## Decision

**El template tiene un solo contrato de datos y dos fuentes que lo cumplen.**

El contrato esta en `src/services/data/site.ts`:

```ts
{
  content: {
    "section.hero": HeroContent,
    "section.navbar": NavbarContent,
    "section.skills": SkillsContent,
    "section.aboutme": AboutMeContent,
    "section.projects": ProjectsContent,
    "section.contact": ContactContent,
    "section.footer": FooterContent,
    "project.<slug>": ProjectItem,   // uno por proyecto
  },
  metadata: {
    "section.hero": HeroMetadata,
    "general.contacts": GeneralContacts,
    "section.skills": SkillsMetadata,
    "section.aboutme": AboutMeMetadata,
    "project.<slug>": ProjectsMetadata,
  },
}
```

- **content**: textos traducibles. Cambian con el idioma.
- **metadata**: datos no traducibles (imagenes, links, categorias, flags).

Las dos fuentes:

| Modo       | Origen                                    | Cuando se usa                     |
| ---------- | ----------------------------------------- | --------------------------------- |
| `static`   | JSON local en `src/services/data/static/` | Sin base de datos, prototipos, CI |
| `supabase` | RPC `get_site_payload`                    | Produccion, contenido editable    |

**El contrato no depende del modo.** Los dos devuelven exactamente la misma
forma, por eso **ningun componente sabe de donde salieron los datos**.

### El switch

`src/services/env.ts:102-108`:

```ts
export function resolveDataSource(): DataSource {
  const configured = process.env.DATA_SOURCE;
  if (configured === "static" || configured === "supabase") {
    return configured;
  }
  return isSupabaseConfigured() ? "supabase" : "static";
}
```

Tres reglas, en orden:

1. `DATA_SOURCE=static` fuerza el modo estatico.
2. `DATA_SOURCE=supabase` fuerza el modo Supabase.
3. **Sin `DATA_SOURCE`**: usa Supabase solo si hay credenciales cargadas
   (`isSupabaseConfigured()` comprueba que existan
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`); si
   no, cae al JSON estatico.

El punto 3 es lo que hace que el template **arranque sin `.env.local`**: un
proyecto recien clonado levanta y muestra el contenido de ejemplo.

### Donde se aplica el switch

En un solo lugar, `src/services/data/site.ts:214-234`:

```ts
export const getSiteData = async (lang: string = DEFAULT_LANG) => {
  const source = resolveDataSource();
  const fetcher = source === "supabase" ? fetchFromSupabase : fetchFromStatic;
  ...
};
```

`getSiteData` es la **unica** puerta de entrada a los datos. Todo lo que
consume el sitio pasa por ahi.

### La validacion es comun a los dos modos

`parsePayload()` (`site.ts:109`) valida el payload contra los schemas de Zod
**despues** de obtenerlo, sin importar de donde vino. Si un bloque no cumple
el schema, `getSiteData` lanza:

```
[site] Missing content for "section.hero"
[site] Invalid content for "section.hero": <mensaje de Zod>
```

Esto es lo que hace que los dos modos sean intercambiables de verdad: no solo
devuelven la misma forma, **fallan de la misma manera**.

### Por que los JSON estaticos no se borran

Aunque el proyecto termine en modo Supabase, `src/services/data/static/`
**se queda**. Es el fallback automatico del punto 3 de arriba, y también:

- Permite levantar el proyecto sin credenciales (preview de Vercel, CI, otra
  maquina).
- Es la referencia del shape esperado: cuando hay que cargar contenido en
  Supabase a mano, el JSON dice exactamente que keys y que forma.
- Permite el modo "desconectado": develop sin base de datos.

Borrarlos es una decision del proyecto, no del template.

## Alternativas descartadas

### Solo JSON estatico (sin Supabase)

Descartado: no hay panel de edicion, cada cambio de texto es un commit y un
deploy, y el multi-idioma obliga a duplicar archivos JSON.

### Solo Supabase

Descartado: el template deja de arrancar sin configuracion. Todo proyecto
nuevo, todo preview y todo CI tendrian que levantar una base de datos para
ver el sitio. Es una barrera de entrada innecesaria para el caso mas comun.

### Dos APIs distintas segun el modo

Por ejemplo, que los componentes lean de `supabase.from("content_blocks")` en
un modo y de `import siteEs from "./site.es.json"` en el otro. **Descartado
por ser el problema que esta decision existe para evitar**: el shape, las
validaciones y el cache se duplican, y los componentes dejan de ser
agnosticos. Es la razon de que el switch este en `getSiteData` y no mas abajo.

### Un solo modo con "datos de ejemplo en la base"

Descartado: crear un proyecto de Supabase, correr 5 queries y esperar los
tiempos de la base para ver un texto de ejemplo es una friccion absurda para
el primer momento del proyecto.

### Abstraccion de repositorio (interfaz `ContentRepository`)

Descartado: introduce una capa de indireccion que no aporta. Con dos
implementaciones y un solo metodo (`getSiteData`), un `switch` de una linea es
mas simple de leer y de debuggear que una interfaz, sus implementaciones y su
inyeccion de dependencias.

La regla que hace que no haga falta: **el contrato esta en los datos, no en
las clases**. Si el payload es el mismo, el tipo de retorno es el mismo, y el
resto del codigo no cambia.

### Un solo origen para todo (JSON o Supabase) pero con dos variables de env

Por ejemplo `DATA_SOURCE` mas `SUPABASE_ENABLED`. Descartado: son dos
variables que se contradicen. Una sola variable con dos valores explicitos, y
un default sensato, es menos estado.

## Consecuencias

### Para el que trabaja en el proyecto

**Cambiar de modo es cambiar una variable de entorno.** No es refactorizar.

```bash
# .env.local
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Despues: reiniciar el dev server. En desarrollo no hay cache, asi que el
cambio se ve en el siguiente render.

**Para pasar a Supabase hay que correr `setup-database.sql`.** Ver
`docs/setup-database.md`. Sin ese SQL, la RPC `get_site_payload` no existe.

**Los componentes no se tocan al cambiar de modo.** Si un componente necesita
un dato nuevo, el trabajo es: definir el schema Zod, agregar el bloque a los
JSON y a la base, y pasar la prop. Nunca "adaptar el componente al modo".

**El cache es por idioma.** En produccion, `getSiteData` cachea 1 hora con
`unstable_cache` y el tag `site:<lang>`. Para invalidar:

```ts
revalidateTag("site:es");
```

En desarrollo no hay cache: siempre se lee de la fuente.

**El shape es snake_case en metadata.** Los schemas Zod tienen que matchear el
shape real de la base (`link_github`, `is_relevant`). Si pones `linkGithub` en
el schema, la `safeParse` falla en runtime y TypeScript no se entera. Es la
trampa mas sutil de este modo: el JSONB de la base no esta tipado, asi que el
error aparece tarde.

**El JSON estatico y la base tienen que coincidir.** Si un bloque esta en la
base pero no en el JSON (o al reves), el sitio se ve bien en un modo y falla en
el otro. El `content` de cada traduccion tiene que matchear el schema Zod
**por idioma**: si `section.hero` esta en `es` pero no en `en`, la app funciona
en español y explota en ingles.

### Impacto en el contrato

**Alto y explicito.** La tabla de compatibilidad del `template-guide.md` marca
esto:

| Cambio                                                             | Compatible |
| ------------------------------------------------------------------ | ---------- |
| Cambiar `resolveDataSource()` o el nombre de `DATA_SOURCE`         | **No**     |
| Cambiar el contrato de `getSiteData` / `pickProjects`              | **No**     |
| Cambiar el shape del payload (`content`/`metadata`)                | **No**     |
| Cambiar la clave de un bloque (`section.hero` → `section.hero_v2`) | **No**     |

Cambiar cualquiera de estas cosas rompe el `.env` de cada proyecto derivado y
todos los JSON y filas de base que dependan del shape. Son cambios de **major**
del template, no de patch.

### Que es del template y que es del proyecto

| Cosa                                 | Donde vive   |
| ------------------------------------ | ------------ |
| El mecanismo de los dos modos        | **Template** |
| El contrato (`content` / `metadata`) | **Template** |
| Que modo usar en cada proyecto       | **Proyecto** |

El template congela el **como**; el proyecto decide el **que**.

## Archivos relacionados

| Archivo                                     | Rol                                              |
| ------------------------------------------- | ------------------------------------------------ |
| `src/services/env.ts`                       | `resolveDataSource()` y `isSupabaseConfigured()` |
| `src/services/data/site.ts`                 | `getSiteData`, `pickProjects`, `parsePayload`    |
| `src/services/data/static/site.<lang>.json` | Los payloads del modo estatico                   |
| `src/components/schemas.ts`                 | Los schemas Zod: el contrato que valida todo     |
| `src/services/supabase/server.ts`           | Cliente de Supabase para el servidor             |
| `setup-database.sql`                        | El esquema de la base + la RPC                   |
| `docs/setup-database.md`                    | Como pasar a modo Supabase paso a paso           |
| `docs/data/README.md`                       | El contrato de datos                             |
