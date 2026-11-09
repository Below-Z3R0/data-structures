# Theming v2

Sistema de temas con 4 paletas y 45 variables CSS por paleta.

## Archivos

| Archivo                                  | Rol                                                                |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `src/app/globals.css`                    | Fuente de verdad: `@theme`, las 4 paletas, clases de background FX |
| `src/components/hooks/themeProvider.tsx` | Wrapper de `next-themes` con las 4 paletas fijas                   |
| `src/components/hooks/useTheme.tsx`      | Hook tipado con los 4 themes                                       |
| `src/components/hooks/theming.v2.ts`     | Tipos y convenciones del sistema (documentacion ejecutable)        |
| `src/components/atoms/ThemeSwitcher.tsx` | Menu para elegir paleta                                            |
| `src/components/atoms/ThemeToggle.tsx`   | Toggle rapido dark/light                                           |
| `src/app/layout.tsx`                     | Monta el provider + script anti-FOUC                               |

## Las 4 paletas

| Clase             | Origen   | Descripcion                 |
| ----------------- | -------- | --------------------------- |
| `.dark`           | Default  | Violeta oscuro, fondo negro |
| `.light`          | Default  | Violeta claro, fondo blanco |
| `.rosepine-dark`  | Noctalia | Rosepine main               |
| `.rosepine-light` | Noctalia | Rosepine Dawn               |

Cada paleta define **las mismas 45 variables**. Si agregás una variable nueva,
tenes que agregarla en las 4 paletas o el sistema se rompe.

## Como funciona el cambio de tema

```
1. Usuario clickea ThemeSwitcher
2. useTheme() llama a next-themes setTheme()
3. next-themes escribe en localStorage bajo la key "theme"
4. next-themes aplica la clase en <html>
5. todas las utilities de Tailwind leen las vars CSS y cambian solas
```

El paso 5 es la clave: los componentes **no** saben que tema hay activo.
Usan `bg-background`, `text-foreground`, etc. y el CSS resuelve.

## Anti-FOUC

Sin el script anti-FOUC, el `<html>` arranca sin clase de tema y el usuario ve
un flash del tema por defecto antes de que React hidrate.

`src/app/layout.tsx` inyecta un script sincronico que lee `localStorage.theme`
y aplica la clase antes del primer paint:

```tsx
<Script id="theme-anti-fouc" strategy="beforeInteractive">
  {ANTI_FOUC_SCRIPT}
</Script>;
```

## Agregar una variable nueva

1. Definir el valor por defecto en `:root` o en la primera paleta.
2. Definir el valor en las **4** paletas.
3. Exponerla en `@theme` como `--color-<nombre>: var(--<nombre>);`
4. Documentarla en `theming.v2.ts` (tipo `ThemeToken`).

## Agregar una paleta nueva

Son 8 pasos en 5 archivos (el bloque de CSS, el tipo `Theme` en dos
lugares, los labels, los dos arrays `themes` y la `ANTI_FOUC_SCRIPT`).

La receta completa, con los paths y los nombres exactos de cada variable, esta
en **[`paleta-nueva.md`](./paleta-nueva.md)**.

## Regla de los selectores

En `globals.css` las paletas se definen con selectores de clase directa
(`.dark { ... }`). Si necesitas aplicar vars a un subárbol, usá `:where()`
para no subir la especificidad:

```css
/* Bien: especificidad 0, no pisa nada */
:where(.dark, .dark body) { ... }

/* Mal: especificidad alta, pisa reglas posteriores */
.dark body { ... }
```

## Convenciones de uso

| Correcto                  | Incorrecto                               |
| ------------------------- | ---------------------------------------- |
| `border border-border`    | `border` (falta el color)                |
| `text-foreground`         | `text-background` (confundido con el bg) |
| `bg-muted`                | `bg-border` (no existe)                  |
| `text-muted-foreground`   | `text-body` (no existe)                  |
| `border border-glow`      | `border border border-glow` (triple)     |
| `text-primary-foreground` | `text-white` (hardcoded)                 |
| `bg-popover`              | `bg-slate-900/50` (hardcoded)            |
