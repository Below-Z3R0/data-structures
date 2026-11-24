---

type: docs
module: components
status: active
created: 2026-11-09
tags: [components, atomic-design, react, nextjs]
---

# Componentes

Atomic design: tres niveles, una sola direccion de dependencia.

```
  ┌─────────────────────────────────────────────────────────┐
  │  organisms/          Secciones completas de la pagina   │
  │  ErrorPage                                               │
  │  Reciben props tipadas. No hacen fetch.                 │
  └───────────────────────────┬─────────────────────────────┘
                              │  importa
  ┌───────────────────────────▼─────────────────────────────┐
  │  molecules/           Composiciones con estado           │
  │  Modal                                                  │
  └───────────────────────────┬─────────────────────────────┘
                              │  importa
  ┌───────────────────────────▼─────────────────────────────┐
  │  atoms/              Primitivas visuales                │
  │  Button · FieldInput · Title1..4 · Paragraph            │
  │  Span · ThemeSwitcher · ThemeToggle · LanguageSwitcher  │
  │  NoiseTexture · BackgroundFX                            │
  │  Sin lógica de negocio. Sin datos de la base.           │
  └─────────────────────────────────────────────────────────┘
```

`organisms → molecules → atoms`. Nunca al reves. Un atom nunca importa
una molecule.

## Que hay hoy

| Nivel        | Componentes                                                                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atoms/`     | `BackgroundFX` · `Button` · `FieldInput` · `LanguageSwitcher` · `NoiseTexture` · `Paragraph` · `Span` · `ThemeSwitcher` · `ThemeToggle` · `Title1` · `Title2` · `Title3` · `Title4`                                                          |
| `molecules/` | `Modal`                                                                                                                                                                                                                                      |
| `organisms/` | `ErrorPage`                                                                                                                                                                                                                                  |
| dominio      | `src/app/estructuras/` — `EstructurasContainer` · `EstructurasHero` · `EstructuraMenu` · `EstructuraSection` · `pilaAdapter` · `colaAdapter` · `PilaSection` · `ColaSection` · `PilaVisualizer` · `ColaVisualizer` · `PilaCell` · `ColaCell` |

Ademas: `animations/` (primitivas de Motion), `hooks/` (ThemeProvider y
`useTheme`), `skeletons/` (`HomePageSkeleton`, `SkeletonPulse`).

## Server vs Client

Todo es **Server Component** salvo que necesite estado o interaccion del
navegador.

| Componente         | Tipo       | Por que                         |
| ------------------ | ---------- | ------------------------------- |
| `ErrorPage`        | Server     | Solo renderiza props            |
| `Modal`            | **Client** | AnimatePresence y handlers      |
| `FieldInput`       | **Client** | Input controlado                |
| `LanguageSwitcher` | **Client** | `useRouter` + `useSearchParams` |
| `ThemeSwitcher`    | **Client** | `useTheme`                      |

Los componentes del dominio de estructuras viven en `src/app/estructuras/`:
`EstructurasContainer` (Client, dueno del estado de la estructura activa),
`EstructurasHero` (Client, cabecera + menu), `EstructuraMenu` (Client, los
botones del menu), `EstructuraSection` (Client, estado e historial genericos de
una estructura), `pilaAdapter` / `colaAdapter` (modulos planos, sin JSX propio),
`PilaSection` / `ColaSection` (Client, 17 lineas: data + adapter + visualizador),
`PilaVisualizer` y `ColaVisualizer` (**Client por importacion**: los renderiza
una Section que ya es Client, aunque no lleven `"use client"` propio) y
`PilaCell` / `ColaCell` (Client, AnimatePresence para el valor de la celda).

`src/app/page.tsx` es un Server Component: **no puede tener estado**. El
estado de la pila vive en `PilaSection`, que es `"use client"`. El estado
de la estructura seleccionada vive en `EstructurasContainer`, que es el
ancestro comun de la cabecera y de la seccion de la estructura.

## El bug del barrel (importar directo)

> Cuando un **Server Component** importa un **Client Component** a
> traves del barrel `components/components.ts`, Turbopack lo resuelve
> como `undefined` y la pagina revienta con:
>
> `Element type is invalid: expected a string ... but got: undefined`

El fix es **importar directo del archivo**:

```tsx
// ✗ falla en runtime
import { LanguageSwitcher } from "../components";

// ✓ funciona
import { LanguageSwitcher } from "../atoms/LanguageSwitcher";
```

Aplica a todos los imports desde un Server Component. Los Client
Components pueden usar el barrel sin problema.

Estado real del barrel: el unico import que lo usa en todo `src/` es
`src/app/error.tsx:4`, y es un Client Component, asi que no sufre el bug. Todo
el resto —`page.tsx`, el dominio y los layouts— importa directo del archivo.

## Props

- Cada componente compartido declara sus props en su propio archivo.
- Los contratos del dominio viven en `src/app/estructuras/types.ts`.
- Los tipos del dominio se infieren con `z.infer` desde
  `src/app/estructuras/schemas.ts`.
- Si un prop no describe **como se ve** el componente sino **que dato**
  es, ese prop pertenece al organism, no a la molecule. Por eso
  `PilaSection` recibe un objeto `data` agrupado y no ocho props
  sueltos.

## El barrel

`src/components/components.ts` es la API publica del sistema de diseno.
Todo componente nuevo se exporta desde ahi.

## Skeletons

Hay un skeleton por seccion, indexados desde
`src/components/skeletons/skeletonindex.tsx`. `src/app/loading.tsx`
consume el de pagina completa (`HomePageSkeleton`) y
`src/app/error.tsx` consume `ErrorPage`.

Los skeletons se usan para el primer prototipo. Despues, el usuario
indica cuando actualizarlos: no los reescribas por iniciativa propia.

## Agregar un componente

1. Definir el nivel (atom, molecule u organism).
2. Declarar los props en el propio componente.
3. Implementarlo en `src/components/<nivel>/<Nombre>.tsx`.
4. Exportarlo desde `components.ts`.
5. Si es una seccion nueva, agregar su skeleton.

Los componentes de un dominio NO van aqui: viven en
`src/app/estructuras/` con sus `components/`, `containers/` y `services/`.
