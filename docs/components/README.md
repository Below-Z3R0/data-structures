# Componentes

Atomic design estricto: tres niveles, una sola regla de dependencia.

## Los tres niveles

```
atoms/       Primitivas visuales sin logica de negocio.
             No conocen el dominio. No reciben datos de la DB.
             Button, Span, Title1..4, Paragraph, IconRender, ThemeSwitcher...

molecules/   Composiciones de atoms con estado o interaccion.
             Modal, Formulary, NavBar, ProjectCard, TecnologiesCard,
             SuccessMessage, ErrorMessage...

organisms/   Secciones completas de la pagina. Reciben props tipadas
             del orquestador. No hacen fetch.
             Header, Footer, HeroSection, SkillsSection, ProjectsSection,
             AboutMeSection, ContactSection, ErrorPage
```

## La regla

```
organisms  ->  molecules  ->  atoms
```

Nunca al reves. Un atom **nunca** importa una molecule. Un organism **nunca**
importa un atom directo sin pasar por el barrel cuando la molecule existe.

## Barrel

`src/components/components.ts` es la API publica del sistema de diseno:

```tsx
import { Button, Title2, HeroSection } from "@/components/components";
```

Los componentes internos usan imports directos (`../atoms/Button`) para no
crear ciclos a traves del barrel.

## Tipos

Los contratos de props viven en `src/components/types.ts`. Los tipos del
dominio (los que salen de la base) viven en `src/components/schemas.ts` y se
inferyen con `z.infer`.

Regla: si un prop no describe como se ve el componente sino que dato es, ese
prop pertenece al organism, no a la molecule.

## Client vs Server

Por defecto todo es **Server Component**. El `"use client"` se pone lo mas
cerca posible de la hoja:

```
app/page.tsx            (server) -> organisms (server)
molecules/ProjectCard   (client)  -> atoms (server)
```

Si un organism necesita `"use client"`, sus hijos server siguen funcionando:
los Server Components se pueden renderizar dentro de un Client Component.

Cuidado con el caso inverso: un Server Component **no** puede importar
directamente un Client Component que use hooks como `useState` en un Server
Component padre sin pasar por `children`.

## Skeletons

Cada seccion tiene su skeleton. Se usan desde `src/app/loading.tsx` y
`src/components/skeletons/`:

| Skeleton                  | Para que sirve                               |
| ------------------------- | -------------------------------------------- |
| `HomePageSkeleton`        | La pagina completa mientras cargan los datos |
| `NavBarSkeleton`          | La barra de navegacion                       |
| `TecnologiesCardSkeleton` | Una card de tecnologia                       |
| `ProjectsCardSkeleton`    | Una card de proyecto                         |
| `FormularySkeleton`       | El formulario de contacto                    |

`error.tsx` y `loading.tsx` **siempre** existen en `src/app/`. Son la red de
seguridad de la UX: sin ellos, un error de datos muestra la pantalla en
blanco.

## Agregar un componente

1. Definir el nivel: atom, molecule u organism. Si dudas, es molecule.
2. Escribir los props en `types.ts`.
3. Implementar el componente.
4. Exportarlo desde `components.ts`.
5. Si es una seccion nueva, agregar su skeleton.
