# Datos

Como el sitio obtiene su contenido y que contrato respeta.

## El contrato de datos

El sitio se alimenta de un unico payload con dos mapas:

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

Los proyectos son dinamicos: se detectan por el prefijo `project.` y se
ordenan alfabeticamente por slug.

## Los dos modos

| Modo       | Origen                                    | Cuando se usa                     |
| ---------- | ----------------------------------------- | --------------------------------- |
| `static`   | JSON local en `src/services/data/static/` | Sin base de datos, prototipos, CI |
| `supabase` | RPC `get_site_payload`                    | Produccion, contenido editable    |

El switch vive en `src/services/env.ts` (`resolveDataSource()`):

```bash
DATA_SOURCE=static     # fuerza el modo estatico
DATA_SOURCE=supabase   # fuerza el modo Supabase
```

Sin `DATA_SOURCE`, se usa Supabase solo si hay credenciales cargadas. Si no,
el template arranca con los JSON de ejemplo.

**Los dos modos devuelven exactamente la misma forma.** Por eso ningun
componente sabe de donde salieron los datos, y cambiar de modo no toca una
sola linea de JSX.

## Archivos

| Archivo                                 | Rol                                                                |
| --------------------------------------- | ------------------------------------------------------------------ |
| `src/services/data/site.ts`             | Orquestador: valida, cachea, expone `getSiteData` y `pickProjects` |
| `src/services/data/static/site.es.json` | Datos estaticos en espanol                                         |
| `src/services/data/static/site.en.json` | Datos estaticos en ingles                                          |
| `src/components/schemas.ts`             | Schemas Zod de cada bloque + tipos del dominio                     |
| `src/services/supabase/`                | Clientes de Supabase (server, browser, middleware)                 |

## Validacion

Todo payload pasa por Zod antes de llegar a un componente. Si un bloque no
cumple el schema, `getSiteData` lanza un error con la key y el mensaje del
problema: falla ruidoso en vez de renderizar datos rotos.

Los bloques con prefijo `project.` se validan contra `ProjectItemSchema` y
`ProjectsMetadataSchema`. Las keys desconocidas que no sean `project.` se
ignoran: pueden ser bloques del panel admin.

## Cache

En produccion, `getSiteData` cachea 1 hora con `unstable_cache` y el tag
`site:<lang>`. Para invalidar:

```ts
revalidateTag("site:es");
```

En desarrollo no hay cache: siempre se lee de la fuente.

## Agregar un proyecto

1. Agregar el bloque `project.<slug>` en `content` (con sus `tecnologies`).
2. Agregar el bloque `project.<slug>` en `metadata` (con `title` y los links).
3. Listo: `pickProjects` lo toma automaticamente.

En modo Supabase, en cambio, hay que insertar en `content_blocks`,
`translations` y `content_blocks_metadata`.

## Agregar una sección nueva

Agregar una sección (por ejemplo `BlogSection`) es mas trabajo que agregar un
proyecto, porque la seccion es una clave fija del contrato de datos. Son 6
pasos en 5 archivos:

| #   | Archivo                                    | Que hacer                                                                                   |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 1   | `src/components/schemas.ts`                | Definir `BlogContentSchema` (y `BlogMetadataSchema` si tiene metadata) con Zod              |
| 2   | `src/components/schemas.ts`                | Exportar los tipos inferidos: `export type BlogContent = z.infer<typeof BlogContentSchema>` |
| 3   | `src/services/data/site.ts`                | Registrar la clave en `CONTENT_SCHEMAS` (y `METADATA_SCHEMAS` si aplica)                    |
| 4   | `src/services/data/site.ts`                | Ampliar los tipos `SiteContent` y `SiteMetadata` con la clave nueva                         |
| 5   | `src/app/page.tsx`                         | Leer `content["section.blog"]` y pasar las props al organism                                |
| 6   | `src/components/organisms/BlogSection.tsx` | El organism, que compone sus molecules y atoms                                              |

Sin los pasos 3 y 4 el bloque **no se valida** contra el schema y no queda
tipado: el payload pasa pero `content["section.blog"]` no existe en el tipo.

Si la seccion tiene metadata, ademas hay que:

- Registrar la clave en `METADATA_SCHEMAS`.
- Ampliar `SiteMetadata`.
- Agregar el schema de metadata en `schemas.ts`.

Los JSON estaticos (`src/services/data/static/site.es.json` y `site.en.json`)
tienen que incluir la clave nueva en `content` y en `metadata`, o el
orquestador lanza `[site] Missing content for "section.blog"`.

Y si la seccion es una pantalla completa (no un bloque de la landing), se
agrega como route group propio en `src/app/`, no dentro de `page.tsx`.

### El orden importa

El paso 3 (registrar en `CONTENT_SCHEMAS`) es el que hace que el bloque se
valide. Sin el, el JSON puede tener la clave y el payload pasaria sin
validar contra ningun schema, y el error apareceria mas tarde y en otro lado.

## Cambiar los idiomas

- **Estatico**: duplicar `site.<lang>.json` y registrarlo en
  `STATIC_PAYLOADS` (`src/services/data/site.ts`).
- **Supabase**: insertar traducciones en `translations` con el `lang_code`.

El idioma se toma de `?lang=` en la URL (`src/app/page.tsx`).

El mecanismo completo (el default, el mapeo a la tabla `translations` con su
`lang_code`, el comportamiento con las anclas y el tipo `Language` duplicado)
esta en **[`docs/i18n/README.md`](../i18n/README.md)**.

## Pasar a modo Supabase

El paso a paso de crear las tablas, la RPC y las policies, cargar el
contenido y verificar el resultado esta en
**[`docs/setup-database.md`](../setup-database.md)**.

La razon de que existan los dos modos esta en
**[`docs/decisions/data-source-switch.md`](../decisions/data-source-switch.md)**.
