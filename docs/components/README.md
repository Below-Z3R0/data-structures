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
  │  HeroSection · PilaSection · ErrorPage                   │
  │  Reciben props tipadas. No hacen fetch.                 │
  └───────────────────────────┬─────────────────────────────┘
                              │  importa
  ┌───────────────────────────▼─────────────────────────────┐
  │  molecules/           Composiciones con estado           │
  │  PilaVisualizer · Modal                                 │
  └───────────────────────────┬─────────────────────────────┘
                              │  importa
  ┌───────────────────────────▼─────────────────────────────┐
  │  atoms/              Primitivas visuales                │
  │  Button · PilaCell · PilaInput · Title1..4 · Paragraph  │
  │  Span · ThemeSwitcher · ThemeToggle · LanguageSwitcher  │
  │  NoiseTexture · BackgroundFX                            │
  │  Sin lógica de negocio. Sin datos de la base.           │
  └─────────────────────────────────────────────────────────┘
```

`organisms → molecules → atoms`. Nunca al reves. Un atom nunca importa
una molecule.

## Que hay hoy

| Nivel        | Componentes                                                                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atoms/`     | `BackgroundFX` · `Button` · `LanguageSwitcher` · `NoiseTexture` · `Paragraph` · `PilaCell` · `PilaInput` · `Span` · `ThemeSwitcher` · `ThemeToggle` · `Title1` · `Title2` · `Title3` · `Title4` |
| `molecules/` | `Modal` · `PilaVisualizer`                                                                                                                                                                      |
| `organisms/` | `ErrorPage` · `HeroSection` · `PilaSection`                                                                                                                                                     |

Ademas: `animations/` (primitivas de Motion), `hooks/` (ThemeProvider y
`useTheme`), `skeletons/` (`HomePageSkeleton`, `SkeletonPulse`).

## Server vs Client

Todo es **Server Component** salvo que necesite estado o interaccion del
navegador.

| Componente         | Tipo       | Por que                                   |
| ------------------ | ---------- | ----------------------------------------- |
| `HeroSection`      | Server     | Solo renderiza props                      |
| `PilaVisualizer`   | Server     | Solo dibuja                               |
| `ErrorPage`        | Server     | Solo renderiza props                      |
| `PilaSection`      | **Client** | Tiene el estado de la pila                |
| `Modal`            | **Client** | AnimatePresence y handlers                |
| `PilaCell`         | **Client** | AnimatePresence para el valor de la celda |
| `PilaInput`        | **Client** | Input controlado                          |
| `LanguageSwitcher` | **Client** | `useRouter` + `useSearchParams`           |
| `ThemeSwitcher`    | **Client** | `useTheme`                                |

`src/app/page.tsx` es un Server Component: **no puede tener estado**. El
estado de la pila vive en `PilaSection`, que es `"use client"`.

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

Los archivos afectados hoy: `src/app/page.tsx`,
`src/components/organisms/HeroSection.tsx`,
`src/components/molecules/PilaVisualizer.tsx`.

## Props

- Los contratos viven en `src/components/types.ts`.
- Los tipos del dominio se infieren con `z.infer` desde
  `src/components/schemas.ts`.
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
2. Escribir los props en `types.ts`.
3. Implementarlo en `src/components/<nivel>/<Nombre>.tsx`.
4. Exportarlo desde `components.ts`.
5. Si es una seccion nueva, agregar su skeleton.
