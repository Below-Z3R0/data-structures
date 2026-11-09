---

type: guide
status: active
created: 2026-11-09
tags: [i18n, lang, translations, nextjs]
---

# i18n

Como el sitio elige el idioma y que pasa con los datos de traduccion.

---

## El mecanismo en una linea

**El idioma viaja en el query param `?lang=`.** No hay reescritura de URL, no
hay middleware de idioma, no hay subcarpetas `/en` y `/es`.

```
http://localhost:3000/?lang=en
```

El orquestador lo lee y lo pasa al servicio de datos. Cambiar de idioma es
cambiar el query param, lo que dispara un re-render del servidor con el
contenido del idioma nuevo.

---

## Donde se lee el parametro

`src/app/page.tsx:23-27`:

```tsx
export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentLang = resolvedParams.lang || "es";

  const { content, metadata } = await getSiteData(currentLang);
```

Dos cosas importantes:

1. **`searchParams` es una Promise** en Next.js 16. Hay que hacer `await`
   antes de leerla. `PageProps` lo declara como
   `searchParams: Promise<{ lang?: string }>`.
2. **El orquestador es un Server Component.** Por eso el cambio de idioma
   dispara un re-fetch del server: no hay ningun cliente que intercambie
   strings en el navegador. El servidor vuelve a renderizar con el payload del
   idioma pedido.

El `currentLang` se pasa a `getSiteData(currentLang)` y despues se usa
**como prop** en un componente:

```tsx
<ProjectsSection
  project_section_data={content["section.projects"]}
  projects_array_data={projects_array_data}
  currentLang={currentLang}
/>;
```

Ese `currentLang` es la unica forma que tiene un componente de saber en que
idioma esta: **no lo deduce del contexto, se lo pasan como prop**.

---

## El idioma por defecto

Hay dos lugares con el default, y no son el mismo concepto:

| Donde                           | Valor  | Que es                                   |
| ------------------------------- | ------ | ---------------------------------------- |
| `src/services/data/site.ts:182` | `"es"` | `DEFAULT_LANG`: el fallback del servicio |
| `src/app/page.tsx:25`           | `"es"` | El default del orquestador               |

`DEFAULT_LANG` (en `site.ts`) es el que usa el servicio de datos:

```ts
// site.ts:182
const DEFAULT_LANG = "es";

// site.ts:185 — modo estatico
const payload = STATIC_PAYLOADS[lang] ?? STATIC_PAYLOADS[DEFAULT_LANG];
```

**Verificado en el navegador**: con `?lang=fr` (un idioma que no existe), el
sitio renderiza **en espanol**. El fallback al default funciona.

> En modo Supabase el fallback es distinto: la RPC `get_site_payload(p_lang)`
> devuelve `content: {}` para un idioma sin traducciones, y `parsePayload`
> explota con `[site] Missing content for "section.hero"`. O sea: **en modo
> Supabase, un idioma sin traducir es un error visible, no un fallback
> silencioso**. Eso es intencional: es mejor fallar que mostrar contenido en
> el idioma equivocado.

---

## Los datos por idioma

### Modo estatico: un JSON por idioma

```
src/services/data/static/site.es.json
src/services/data/static/site.en.json
```

Cada archivo tiene el **shape completo** del payload: `content` y `metadata`,
con las mismas keys en los dos idiomas. Los nombres de las secciones dentro
del JSON son los mismos; lo que cambia es el valor de los textos.

El mapa de los payloads es `STATIC_PAYLOADS` (`site.ts:177-180`):

```ts
const STATIC_PAYLOADS: Record<string, RawPayload> = {
  en: en as unknown as RawPayload,
  es: es as unknown as RawPayload,
};
```

Para agregar un idioma en modo estatico:

1. Copiar `site.es.json` a `site.<nuevo>.json`.
2. Traducir los textos de `content` (los de `metadata` no se traducen).
3. Registrarlo en `STATIC_PAYLOADS`.
4. Agregar el codigo al tipo `Language` de `src/components/types.ts:44`.

### Modo Supabase: filas en `translations`

La tabla `translations` (creada por `setup-database.sql`) tiene una fila por
**bloque por idioma**:

```sql
id         UUID PRIMARY KEY
block_id   UUID REFERENCES content_blocks(id) ON DELETE CASCADE
lang_code  TEXT REFERENCES languages(code) ON DELETE CASCADE
content    JSONB NOT NULL DEFAULT '{}'
UNIQUE(block_id, lang_code)
```

El mapeo es:

| Concepto       | Modo estatico     | Modo Supabase                             |
| -------------- | ----------------- | ----------------------------------------- |
| Un bloque      | una key del JSON  | una fila en `content_blocks`              |
| Un idioma      | un archivo JSON   | un `lang_code` en `translations`          |
| Textos         | `content[<key>]`  | `translations.content` (JSONB)            |
| Datos no texto | `metadata[<key>]` | `content_blocks_metadata.content` (JSONB) |

La tabla `languages` es el catalogo de idiomas disponibles:

```sql
code        TEXT PRIMARY KEY   -- 'es', 'en'
name        TEXT NOT NULL
is_default  BOOLEAN
```

El script de setup inserta `es` (default) y `en`. Para agregar un idioma en
Supabase hay que insertar la fila en `languages` **primero**, porque
`translations.lang_code` tiene foreign key a `languages(code)`.

### La validacion es por idioma

Cada idioma se valida por separado contra los schemas de Zod. Si a
`section.hero` le falta un campo en el JSON de `en`, la app funciona en
espanol y **explota en ingles**. No hay una validacion cruzada.

---

## El `lang` y las anclas

Este es el punto que mas confunde, asi que conviene separar lo que **si**
pasa de lo que **no** pasa.

### Lo que NO pasa: el `lang` no se pierde al navegar por anclas

El `NavBar` usa anclas (`#Home`, `#Tecnologies`, `#Proyects`, `#AboutMe`,
`#Contact`) que vienen del JSON:

```json
{ "id": 3, "link": "#Proyects", "name": "Proyectos" }
```

Como el link es un fragmento puro (`#Proyects`), el navegador **no recarga la
pagina**: solo cambia el fragmento de la URL. El query param queda intacto.

**Verificado en el navegador**:

```
URL inicial:  http://localhost:3000/?lang=en
Click en #Proyects
URL final:    http://localhost:3000/?lang=en#Proyects
search:       ?lang=en        <- intacto
hash:         #Proyects
```

El parametro `?lang=en` **sobrevive**. El idioma no cambia y el sitio sigue
en ingles.

### Lo que SI pasa: el hash se pierde al cambiar de idioma

El `LanguageToggle` hace `router.push()` con el query param nuevo, y el
router reemplaza la URL completa: **se va el fragmento**.

**Verificado en el navegador**:

```
URL inicial:  http://localhost:3000/?lang=es#Proyects
Click en el toggle de idioma
URL final:    http://localhost:3000/?lang=en      <- sin #Proyects
scrollY:      0                                   <- vuelve arriba
```

Es decir: **cambiar de idioma tira al usuario al inicio de la pagina**. No es
un bug de perdida de datos, es una molestia de navegacion: el usuario esta
leyendo la seccion de proyectos, cambia de idioma y de golpe lo manda al
top.

Es el comportamiento esperable de `router.push("?lang=en")`: se construye una
URL nueva desde cero, con solo el query param. La forma de conservarlo seria
leer `window.location.hash` y re-armar la URL, pero **no lo hace el template**
y no es un bug: es una decision de diseno pendiente para el proyecto.

### Como se maneja hoy

No se maneja: el comportamiento actual es el de arriba. Si un proyecto quiere
conservar la posicion, tiene que:

1. Leer el hash actual en el `LanguageToggle`.
2. Re-armar la URL con el hash incluido antes del `router.push`.

```tsx
// src/components/atoms/LanguageToggle.tsx — variante con hash preservado
const toggleLanguage = () => {
  const newLang = currentLang === "es" ? "en" : "es";
  const params = new URLSearchParams(searchParams.toString());
  params.set("lang", newLang);
  const hash = window.location.hash;
  router.push(`?${params.toString()}${hash}`);
};
```

---

## Los dos componentes para cambiar de idioma

Hay **dos** atoms distintos, y solo uno se usa:

| Componente         | Que hace                        | Donde se usa    |
| ------------------ | ------------------------------- | --------------- |
| `LanguageToggle`   | Alterna es/en con un solo boton | `NavBar.tsx:27` |
| `LanguageSwitcher` | Muestra dos botones (es / en)   | **Nadie**       |

Los dos hacen lo mismo tecnicamente: `router.push()` con el `lang` nuevo.
La diferencia es la UI: uno es un boton que alterna, el otro son dos botones
con el nombre del idioma.

El `Switcher` esta exportado en el barrel (`components.ts:12`) pero ningun
componente lo importa. `LanguageToggle` es el que esta en uso.

**Elegir cual usar es decision del proyecto.** La recommendation: si el
proyecto tiene mas de dos idiomas, el `Switcher` (con la lista de idiomas)
es mas usable que el `Toggle` (que hardcodea el par es/en). Si se usa el
`Switcher`, hay que adaptarlo: hoy tiene los dos idiomas fijos en el JSX.

---

## El tipo `Language` esta duplicado

Dos tipos con el mismo nombre y distinta semantica:

| Archivo                                          | Definicion                                                 | Que es                          |
| ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------- |
| `src/components/types.ts:44`                     | `export type Language = "en" \| "es";`                     | Los codigos de idioma validos   |
| `src/services/supabase/types/types.helper.ts:12` | `export type Language = PublicTables["languages"]["Row"];` | La fila de la tabla `languages` |

El primero es el que usa la app. El segundo es el tipo de fila de la base
(para el codigo de un panel admin, por ejemplo). Se pueden coexistir porque
viven en modulos distintos, pero **el nombre es ambiguo**: si un archivo
importa de los dos, hay que renombrar el import.

Un tercer lugar donde viven los idiomas: la tabla `languages` de Supabase.
Los tres tienen que estar sincronizados para agregar un idioma:

1. El tipo `Language` de `src/components/types.ts`.
2. `STATIC_PAYLOADS` en `src/services/data/site.ts` (modo estatico).
3. La tabla `languages` (modo Supabase).

---

## Agregar un idioma

### Modo estatico

1. Copiar `src/services/data/static/site.es.json` a `site.<codigo>.json`.
2. Traducir los textos de `content`. `metadata` no se toca.
3. Registrar el payload en `STATIC_PAYLOADS` (`site.ts:177`).
4. Agregar el codigo al tipo `Language` (`types.ts:44`).
5. Si el idioma no es `es`, revisar `DEFAULT_LANG` (`site.ts:182`): el default
   sigue siendo `es`.

### Modo Supabase

1. Insertar el idioma en `languages`:

   ```sql
   INSERT INTO languages (code, name, is_default) VALUES ('pt', 'Portugues', false);
   ```

2. Cargar las traducciones: una fila en `translations` por bloque, con
   `lang_code = 'pt'`.
3. Actualizar el tipo `Language` de `types.ts` y `STATIC_PAYLOADS` (para que
   el fallback del modo estatico no rompa).

### En los dos casos

4. Actualizar los atoms de idioma si el proyecto usa el `Switcher` (hoy tiene
   es/en hardcodeados).

### Trampas

- **El `metadata` no se traduce.** Si un texto visible esta en `metadata` en
  vez de en `content`, aparece en el idioma equivocado. La regla:
  `content` = texto, `metadata` = dato.
- **La validacion es por idioma.** Un campo faltante en un idioma solo rompe
  ese idioma.
- **El `lang` unknown cae al default en estatico** y **explota en Supabase**.
  Ver la seccion del default.

---

## Verificacion

```bash
# El sitio responde en cada idioma
curl -s 'http://localhost:3000/?lang=es' | grep -c 'Proyectos'   # 4
curl -s 'http://localhost:3000/?lang=en' | grep -c 'Proyectos'   # 0
curl -s 'http://localhost:3000/?lang=en' | grep -c 'Projects'    # 4
```

En el navegador:

1. Cargar `/?lang=en`: la pagina tiene que estar en ingles.
2. Click en una ancla del nav: el `?lang=en` tiene que seguir en la URL.
3. Click en el toggle de idioma: la URL cambia a `?lang=es` y el contenido se
   traduce. El scroll vuelve al top (ver la seccion de las anclas).

---

## Archivos

| Archivo                                       | Rol                                         |
| --------------------------------------------- | ------------------------------------------- |
| `src/app/page.tsx`                            | Lee `?lang=` y lo pasa a `getSiteData`      |
| `src/services/data/site.ts`                   | `DEFAULT_LANG`, `STATIC_PAYLOADS`, cache    |
| `src/services/data/static/site.<lang>.json`   | Un payload por idioma                       |
| `src/components/atoms/LanguageToggle.tsx`     | Toggle es/en (el que se usa)                |
| `src/components/atoms/LanguageSwitcher.tsx`   | Dos botones es/en (no se usa)               |
| `src/components/types.ts`                     | El tipo `Language` (`"en" \| "es"`)         |
| `src/services/supabase/types/types.helper.ts` | El tipo `Language` de la fila de la base    |
| `setup-database.sql`                          | La tabla `languages` y la de `translations` |
| `docs/setup-database.md`                      | Como cargar el contenido en Supabase        |
| `docs/decisions/data-source-switch.md`        | Por que hay dos modos de datos              |
