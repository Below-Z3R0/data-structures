# Motion

Animaciones con `motion` (v14), el paquete `motion/react`.

## Archivos

| Archivo                                        | Rol                                   |
| ---------------------------------------------- | ------------------------------------- |
| `src/components/animations/Animations.tsx`     | Primitivas de animacion y variantes   |
| `src/components/animations/animationsindex.ts` | Barrel de animations                  |
| `src/app/layout.tsx`                           | Monta `LazyMotion` con `domAnimation` |

## LazyMotion + m

El layout raiz envuelve toda la app en `<LazyMotion features={domAnimation} strict>`.
`strict` obliga a usar el componente `m` en vez de `motion`: `m` es la version
lazy que no arrastra todo el codigo de Motion al bundle.

```tsx
import { m } from "motion/react";

<m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} />;
```

Usar `motion.div` dentro de `LazyMotion strict` rompe el build.

## Primitivas disponibles

| Componente      | Uso                    | Comportamiento                 |
| --------------- | ---------------------- | ------------------------------ |
| `SectionReveal` | Secciones completas    | Fade + 24px up                 |
| `TextReveal`    | Parrafos               | Solo opacity                   |
| `SlideReveal`   | Layouts bipartitos     | Entrada direccional            |
| `StaggerGroup`  | Contenedor de listas   | Orquesta el stagger de hijos   |
| `StaggerItem`   | Hijo de `StaggerGroup` | Hereda las variantes del padre |
| `EyebrowReveal` | Mini-titulos           | Slide sutil                    |
| `PopReveal`     | Badges, indicadores    | Entrada con spring             |
| `ExpandLine`    | Separadores            | Linea que se expande (CSS)     |
| `LoadingDots`   | Estados de carga       | 3 puntos animados              |

## Patrones

### WhileInView (reveal al entrar en viewport)

```tsx
<m.div
  variants={sectionVariants}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-10% 0px" }}
>
```

`once: true` es obligatorio: sin el, la animacion se repite cada vez que el
elemento entra y sale del viewport.

### Stagger (revelado en cascada)

```tsx
<StaggerGroup>
  {items.map((item) => (
    <StaggerItem key={item.id}>{item.name}</StaggerItem>
  ))}
</StaggerGroup>;
```

`StaggerItem` no define `initial` ni `whileInView`: hereda las variantes del
padre. Si le pones `initial="hidden"` a mano, rompe la orquestacion.

### AnimatePresence (salidas animadas)

Sin `AnimatePresence`, un elemento que se borra desaparece de golpe. Se
usa para los modales y para las celdas de la pila:

```tsx
<AnimatePresence mode="wait" initial={false}>
  {value !== null && (
    <m.span
      key={`${index}-${value}`}
      initial={{ opacity: 0, scale: 0.4, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.4, y: 10 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {value}
    </m.span>
  )}
</AnimatePresence>;
```

La `key` tiene que cambiar cuando el contenido cambia: es lo que le dice
a Motion que el elemento es otro y que anime la salida del anterior.

`initial={false}` evita que el primer render anime la entrada: en la pila
las celdas vacias aparecen quietas.

## Reglas

- **NUNCA** loops infinitos salvo que sean controlados (`isLoading`).
- **NUNCA** `IntersectionObserver` manual: usar `whileInView`.
- Preferir `viewport={{ once: true }}` en toda animacion de entrada.
- Las variantes se definen a nivel de modulo, no inline en cada componente.
- Si un componente necesita `"use client"`, aislarlo: el `"use client"` debe
  estar lo mas cerca posible de la hoja (el componente interactivo), no en un
  organism que renderiza children de servidor.
