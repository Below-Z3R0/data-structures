# Arquitectura

> Mapa del proyecto: dónde está cada cosa y qué se rompe si la movés.
> Para el _por qué_ de las decisiones, ver `docs/decisions/`.

---

## Qué es

App web interactiva para visualizar estructuras de datos lineales estáticas en
el navegador. Cada estructura se opera con los botones de la pantalla y el
arreglo de memoria se actualiza en tiempo real con sus variables de control.

**Estructuras implementadas:** PILA (LIFO, con `CIMA`) y COLA (circular, con
`FRENTE` y `FINAL`).

**No tiene backend.** No hay Supabase, ni autenticación, ni base de datos, ni
API. Todo el estado vive en el navegador y todos los textos son JSON estáticos
incluidos en el bundle.

---

## Stack

| Capa               | Tecnología                                       |
| ------------------ | ------------------------------------------------ |
| Runtime y paquetes | Bun                                              |
| Framework          | Next.js 16.4.5 (App Router, Turbopack)           |
| UI                 | React 19.3.1                                     |
| Lenguaje           | TypeScript 7.0.2 (estricto)                      |
| Estilos            | Tailwind v4 con `@theme` en `globals.css`        |
| Animaciones        | Motion 14.10.1 con `LazyMotion` + `domAnimation` |
| Validación         | Zod 4.6.7                                        |
| Iconos             | `lucide-react`                                   |
| Lint y formato     | Biome 2.6.6 (no ESLint, no Prettier)             |
| Tests              | Vitest 5.1.0                                     |

---

## Árbol de `src/`

```
src/
├── app/                               # rutas y dominio
│   ├── layout.tsx                     # <html>, fuentes, ThemeProvider, LazyMotion, BackgroundFX
│   ├── page.tsx                       # Server Component: pide datos y compone. Sin lógica.
│   ├── loading.tsx                    # skeleton de streaming
│   ├── error.tsx                      # error boundary de página (fallos de render, no de la estructura)
│   ├── globals.css                    # tokens de las 4 paletas + @theme
│   ├── favicon.ico
│   └── estructuras/                   # ← EL DOMINIO
│       ├── containers/
│       │   └── EstructurasContainer.tsx   # Client. Dueño del estado "qué estructura está activa".
│       ├── components/
│       │   ├── EstructurasHero.tsx        # cabecera: títulos + controles de idioma y tema + menú
│       │   ├── EstructuraMenu.tsx         # botones Pila | Cola (radiogroup)
│       │   ├── EstructuraSection.tsx      # genérico: estado, historial y los 4 modales (una sola copia)
│       │   ├── pilaAdapter.tsx            # traduce pila.ts al contrato del genérico
│       │   ├── colaAdapter.tsx            # traduce cola.ts al contrato del genérico
│       │   ├── PilaSection.tsx            # 17 líneas: data + adapter + visualizador
│       │   ├── ColaSection.tsx            # 17 líneas: idem
│       │   ├── PilaVisualizer.tsx         # arreglo de 6 celdas + panel de estado
│       │   ├── PilaCell.tsx               # una celda: índice, valor, flecha de CIMA
│       │   ├── ColaVisualizer.tsx         # arreglo circular + FRENTE/FINAL/MAX/NE/EL
│       │   └── ColaCell.tsx               # una celda con badges FRENTE y FINAL
│       ├── services/
│       │   ├── pila.ts                    # lógica pura de la PILA. Sin React, sin DOM.
│       │   ├── pila.test.ts               # 18 tests
│       │   ├── cola.ts                    # lógica pura de la COLA circular
│       │   ├── cola.test.ts               # 28 tests
│       │   └── registro.ts                # EstructuraId, ESTRUCTURA_IDS, ESTRUCTURAS
│       ├── schemas.ts                     # contratos Zod + tipos inferidos
│       └── types.ts                       # contratos de UI del dominio
│
├── components/                        # UI COMPARTIDA (no conoce el dominio)
│   ├── atoms/                         # Button, Title1-4, Span, Paragraph, FieldInput,
│   │                                  # ThemeSwitcher, ThemeToggle, LanguageSwitcher,
│   │                                  # NoiseTexture, BackgroundFX
│   ├── molecules/                     # Modal
│   ├── organisms/                     # ErrorPage
│   ├── animations/                    # LazyMotion + domAnimation + SectionReveal
│   ├── hooks/                         # ThemeProvider, useTheme, theming.v2
│   ├── skeletons/                     # HomePageSkeleton, SkeletonPulse
│   └── components.ts                  # barrel: SOLO para Server Components
│
└── services/
    └── data/
        ├── site.ts                    # getSiteData(lang): payload tipado por idioma
        └── static/
            ├── site.es.json
            └── site.en.json
```

**La regla del árbol:** si un archivo menciona `Pila`, `Cola` o `CIMA`, vive en
`app/estructuras/`. Si no menciona ninguna estructura, vive en `components/`.
Antes de M1 el dominio estaba mezclado en `components/organisms` y
`services/data-structures`; ese estado no se repite.

---

## Flujo de datos

```
URL ?lang=es|en
      │
      ▼
src/app/page.tsx                      Server Component, async
      │  getSiteData(lang) → { content, metadata }
      │  ambos validados por TypeScript en compile-time
      ▼
<EstructurasContainer hero={…} pila={…} />     Client Component
      │  useState<EstructuraId>(hero.meta.estructuras[0].id)
      ├── <EstructurasHero />                    títulos, idioma, tema
      │        └── <EstructuraMenu />            onClick → setActiva(id)
      └── estructura activa (montada, oculta con hidden si no está activa)
               └── <PilaSection data={content["section.pila"]} />
                        │  useState: pila, historial, modal, error, inputs
                        │  llama a services/pila.ts (funciones puras)
                        └── <PilaVisualizer pila={pila} /> → <PilaCell /> ×6
```

**Ningún componente consulta la fuente de datos por su cuenta.** Solo
`page.tsx` pide datos; el resto recibe props tipadas.

**La lógica no vive en React.** `services/pila.ts` son funciones puras:
reciben un estado y devuelven uno nuevo más el resultado. Se puede testear sin
montar nada. Todo componente que necesite operar llama a ese servicio.

---

## Server vs Client

| Componente                                                 | Tipo                       | Por qué                                                    |
| ---------------------------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| `app/page.tsx`                                             | Server                     | pide datos, no tiene estado                                |
| `app/layout.tsx`                                           | Server                     | metadatos y fuentes                                        |
| `app/estructuras/containers/EstructurasContainer.tsx`      | Client                     | dueño de `activa`                                          |
| `EstructurasHero`, `EstructuraMenu`                        | Client                     | eventos y menú                                             |
| `PilaSection`                                              | Client                     | estado de la pila y modales                                |
| `PilaVisualizer`                                           | Client **por importación** | lo renderiza `PilaSection`; no lleva `"use client"` propio |
| `PilaCell`                                                 | Client                     | `AnimatePresence`                                          |
| `Modal`, `FieldInput`, `ThemeSwitcher`, `LanguageSwitcher` | Client                     | eventos                                                    |
| `ErrorPage`                                                | Server                     | no usa hooks                                               |
| atoms de texto (`Title1-4`, `Span`, `Paragraph`)           | Server                     | presentacionales                                           |

**Trampa conocida:** los Client Components se importan **directo del archivo**,
nunca desde el barrel `components.ts`. Con Turbopack, un Server Component que
importa un Client Component a través del barrel recibe `undefined` y rompe con
`Element type is invalid`. Ya pasó dos veces.

---

## Dónde buscar

| Si querés cambiar…                                    | Archivo                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| La lógica de la pila (meter, sacar, editar, regresar) | `app/estructuras/services/pila.ts`                                |
| La lógica de la cola (insertar, eliminar, NE, EL)     | `app/estructuras/services/cola.ts`                                |
| Los errores de la estructura                          | `ErrorPila` / `ErrorCola` + `errors` en los JSON                  |
| El arreglo de celdas y la flecha de CIMA              | `components/PilaCell.tsx`, `PilaVisualizer.tsx`                   |
| El arreglo circular y los punteros FRENTE/FINAL       | `components/ColaCell.tsx`, `ColaVisualizer.tsx`                   |
| Los botones de operación                              | `components/PilaSection.tsx`, `ColaSection.tsx`                   |
| El menú entre estructuras                             | `components/EstructuraMenu.tsx`                                   |
| Agregar una estructura nueva                          | ver "Receta" abajo                                                |
| Un texto de la pantalla                               | `services/data/static/site.{es,en}.json`                          |
| Un color o paleta                                     | `app/globals.css` (36 variables × 4 paletas)                      |
| El idioma por defecto                                 | `services/data/site.ts` (`DEFAULT_LANG`)                          |
| Una animación                                         | `components/animations/Animations.tsx` o el componente que la usa |

### Receta: agregar una estructura nueva

1. `app/estructuras/services/<nombre>.ts` — lógica pura, sin React. Con sus tests.
2. `EstructuraId` y `ESTRUCTURA_IDS` en `app/estructuras/services/registro.ts`.
3. `app/estructuras/components/<Nombre>Section.tsx` y su visualizador.
4. `section.<nombre>` en `schemas.ts` (`SiteContent`) y en **los dos** JSON.
5. Renderizarla en `EstructurasContainer`.
6. `docs/estructuras/README.md`, `bugs.md`, `tests.md`.

**Ojo:** el menú de estructura se alimenta de
`metadata["section.hero"].estructuras` de los JSON, no de `ESTRUCTURAS`. Si
agregás la estructura solo en `registro.ts`, el botón no aparece. El `id` del
JSON está tipado contra `EstructuraId`, así que TypeScript avisa si no coincide.

---

## Comandos

```bash
bun install         # dependencias
bun run dev         # servidor de desarrollo (localhost:3000)
bun run build       # build de producción
bun run start       # servir el build
bun run typecheck   # tsc --noEmit
bun run lint        # biome check
bun run format      # biome format --write
bun run test        # vitest run
bun run test:watch  # vitest en watch
```

**Antes de dar algo por terminado:** `typecheck`, `lint`, `test` y `build`, los
cuatro en verde.

---

## Reglas que no se rompen

1. **`page.tsx` no tiene estado.** Es Server Component; el estado va en el
   container o en la sección.
2. **`page.tsx` no tiene lógica de negocio.** Pide datos y compone.
3. **La lógica de una estructura no importa React.** `services/*.ts` son
   funciones puras y testeables.
4. **No hay backend.** Si algo necesita persistencia, no va acá.
5. **Client Components: import directo, nunca por el barrel.**
6. **Un token de color nuevo va en las 4 paletas** de `globals.css` y en
   `@theme`.
7. **No hay `transition: all`** ni loops infinitos de animación.
8. **La documentación del dominio vive en `docs/estructuras/`**; este archivo es
   solo el mapa.

---

## Estado actual del desarrollo

PILA y COLA implementadas y verificadas en el browser, con 46 tests verdes.

Los hallazgos abiertos están en `docs/estructuras/bugs.md` con su severidad e
ID. Queda deuda de accesibilidad (C1, C3), el cast de C2 y la simplificación
de `PilaSection` / `ColaSection`, que hoy comparten la forma pero no el código.
Ningún módulo se considera cerrado con ALTOS abiertos.
