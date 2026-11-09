---

type: docs
module: i18n
status: active
created: 2026-11-09
tags: [i18n, lang, espanol, ingles]
---

# Idiomas

El idioma se elige por **query param**: `?lang=es` (default) o
`?lang=en`.

## Como funciona

1. `src/app/page.tsx` lee `searchParams.lang`.
2. `getSiteData(lang)` devuelve el JSON estatico de ese idioma.
3. Los textos llegan a los componentes como props.

```tsx
const resolvedParams = await searchParams;
const currentLang = resolvedParams.lang || "es";
const { content, metadata } = await getSiteData(currentLang);
```

Los dos JSON tienen **la misma forma**: solo cambia el idioma de los
textos. El `lang_code` no existe (no hay base de datos).

## Cambiar de idioma en la UI

El `LanguageSwitcher` (atom, client) usa `useRouter` + `useSearchParams`
para preservar el resto de la query y cambiar solo el `lang`:

```tsx
const params = new URLSearchParams(searchParams.toString());
params.set("lang", newLang);
router.push(`?${params.toString()}`);
```

## Default y fallback

- Default: `es`.
- Si se pide un idioma que no existe, `getSiteData` cae al español
  (`STATIC_PAYLOADS[DEFAULT_LANG]`). No hay error: la pagina siempre
  renderiza.

## Tipos

`Language` vive en `src/components/types.ts`:

```ts
export type Language = "en" | "es";
```

Al agregar un idioma: duplicar el JSON, registrarlo en
`STATIC_PAYLOADS` (`src/services/data/site.ts`) y ampliar el tipo
`Language`.

## Que NO es traducible

La metadata no se traduce: `metadata["section.hero"].estructuras` trae
el `id` tecnico (`pila`) que usa el codigo. El `label` y la
`description` de cada estructura si viven en el JSON de cada idioma, asi
que el menu muestra "Pila" en espanol y "Stack" en ingles.
