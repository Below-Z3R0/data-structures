---
type: decision
status: active
created: 2026-11-09
tags: [decision, datos, static, sin-backend]
---

# Decision: Datos estaticos, sin backend

## Contexto

El proyecto nace de un template (Next.js 16) que traia un modo dual de
datos: JSON estatico o Supabase (RPC `get_site_payload`), con un switch
`DATA_SOURCE` en `src/services/env.ts`.

Para este trabajo practico el contenido es **fijo**: dos titulos, los
textos de la seccion de pila y el menu de estructuras. No hay usuarios,
ni contenido editable, ni nada que un backend pudiera servir mejor.

## Decision

El proyecto usa **un solo origen de datos: JSON estatico local**, en
`src/services/data/static/site.es.json` y `site.en.json`.

Se elimino:

- `src/services/supabase/` (clientes server, browser y middleware).
- `src/services/env.ts` (el switch `DATA_SOURCE` y los getters de env).
- `setup-database.sql` y `docs/setup-database.md`.
- `middleware.ts` (refresco de sesion de Supabase).
- El route group `(admin)/`, `login/` y `auth/`.
- El formulario de contacto con EmailJS y `react-hook-form`.
- El `images.loaderFile` de Supabase en `next.config.ts`.

No hay variables de entorno: no hay `.env.local` que configurar.

## Alternativas descartadas

| Alternativa                          | Por que no                                                   |
| ------------------------------------ | ------------------------------------------------------------ |
| **Supabase con contenido editable**  | El contenido es fijo por laassignment. Un CRUD es alcance extra. |
| **Mantener el modo dual**            | Un switch con una sola rama posible es ruido: el codigo de la rama muerta no se prueba. |
| **Hardcodear los textos en el JSX**  | Rompe el i18n (`?lang=`) y la convencion de contenido del template. Los textos van en el JSON. |
| **`localStorage` para persistir**    | La pila es un ejercicio en memoria, no un estado a conservar entre recargas. |

## Consecuencias

- `getSiteData(lang)` es sincrono en su origen: no hay cache, ni red, ni
  invalidacion de tags.
- Los schemas de Zod siguen validando el payload: un JSON mal editado
  falla ruidoso con `[site] Invalid content for "section.pila": ...`.
- Agregar un idioma es duplicar el JSON y registrarlo en
  `STATIC_PAYLOADS`.
- Los tests no necesitan mocks de red: el payload es un import.
