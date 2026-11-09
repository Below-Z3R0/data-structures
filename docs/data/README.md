---

type: docs
module: data
status: active
created: 2026-11-09
tags: [datos, static, zod, i18n]
---

# Datos

Como el sitio obtiene su contenido y que contrato respeta.

## Origen: unico y local

Este proyecto **no tiene backend**. No hay Supabase, ni RPC, ni
variables de entorno, ni `.env.local`. El contenido vive en JSON
estaticos:

```
src/services/data/static/
  site.es.json
  site.en.json
```

No hay switch de origen de datos: hay una sola fuente posible.

## El contrato de datos

El sitio se alimenta de un unico payload con dos mapas:

```ts
{
  content: {
    "section.hero": HeroContent,   // textos de la cabecera
    "section.pila": PilaContent,   // textos de la seccion de pila
  },
  metadata: {
    "section.hero": HeroMetadata,  // estructuras del menu
  },
}
```

- **content**: textos traducibles. Cambian con el idioma.
- **metadata**: datos no traducibles (el menu de estructuras).

Cada idioma tiene su propio JSON con sus textos. La estructura del
payload es la misma en ambos: lo que cambia es el idioma, no la forma.

## Archivos

| Archivo                                 | Rol                                              |
| --------------------------------------- | ------------------------------------------------ |
| `src/services/data/site.ts`             | Orquestador: valida y expone `getSiteData(lang)` |
| `src/services/data/static/site.es.json` | Datos estaticos en espanol                       |
| `src/services/data/static/site.en.json` | Datos estaticos en ingles                        |
| `src/components/schemas.ts`             | Schemas Zod de cada bloque + tipos del dominio   |

## Validacion

El payload esta **tipado, no validado en runtime**. Los JSON se importan
con `resolveJsonModule` y se asignan a `Record<string, SitePayload>`, asi
que **TypeScript verifica la forma en compile-time**: si un bloque del
JSON no cumple el tipo `SitePayload`, el build falla.

```ts
const STATIC_PAYLOADS: Record<string, SitePayload> = {
  en: en,
  es: es,
};
```

Los schemas Zod de `src/components/schemas.ts` siguen existiendo, pero
como **fuente de los tipos del dominio** (`z.infer`), no como validacion
en runtime. La validacion en runtime solo tiene sentido cuando el dato
viene de afuera (una API, un formulario): aca el dato es un archivo del
repo, y si esta mal el error aparece al compilar.

La validacion en runtime **si** se usa donde el dato entra del exterior:
el valor que el usuario tipea en el modal de insercion, validado con
`ValorPilaSchema` (ver `docs/structures/README.md`).

## Sin cache

`getSiteData` no cachea nada. Antes el template cacheaba 1 hora con
`unstable_cache` porque el origen era una RPC de red. Con JSON local el
cache no aporta nada y solo complica el debug.

## Agregar una sección nueva

Agregar una seccion (por ejemplo `section.cola`) son 4 pasos en 4
archivos:

| #   | Archivo                                    | Que hacer                                                                       |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| 1   | `src/components/schemas.ts`                | Definir `ColaContentSchema` con Zod                                             |
| 2   | `src/components/schemas.ts`                | Exportar el tipo: `export type ColaContent = z.infer<typeof ColaContentSchema>` |
| 3   | `src/services/data/site.ts`                | Ampliar el tipo `SiteContent` con la clave nueva                                |
| 4   | `src/app/page.tsx`                         | Leer `content["section.cola"]` y pasar las props al organism                    |
| 5   | `src/components/organisms/ColaSection.tsx` | El organism, que compone sus molecules y atoms                                  |

Sin el paso 3 el bloque no queda tipado: el acceso a
`content["section.cola"]` seria un error de TypeScript.

Los JSON estaticos tienen que incluir la clave nueva en `content` y en
`metadata`: si falta, TypeScript marca el acceso a
`content["section.cola"]` como error.

Si la seccion tiene metadata, ademas hay que:

- Ampliar `SiteMetadata`.
- Agregar el schema de metadata en `schemas.ts`.

## Agregar un idioma

1. Duplicar `site.<lang>.json`.
2. Registrarlo en `STATIC_PAYLOADS` (`src/services/data/site.ts`).
3. Agregar el codigo al tipo `Language` (`src/components/types.ts`).

El idioma se toma de `?lang=` en la URL (`src/app/page.tsx`). El
mecanismo completo esta en **[`docs/i18n/README.md`](../i18n/README.md)**.
