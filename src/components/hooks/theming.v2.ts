// NOTE: Este archivo existe únicamente para integrar globals.css dentro del grafo de Graphify.
// NO es código real de la app. Es un nodo conceptual que apunta al sistema de theming v2.
//
// El sistema de theming vive en src/app/globals.css (no procesado por Graphify porque es CSS).
// Este módulo expone el sistema como tipos TypeScript para que Graphify y tu memoria lo tracen.
//
// VERDAD: este archivo no se importa en ningún componente. Es solo documentación ejecutable.

/**
 * Sistema de theming v2 de portfolio-v2.
 *
 * 4 paletas: .dark, .light, .rosepine-dark, .rosepine-light
 * 45 variables CSS por paleta: ver docs/theming/README.md
 *
 * Archivos del sistema:
 *   - src/app/globals.css                 → 45 vars × 4 paletas + @theme + utility classes
 *   - src/components/hooks/useTheme.tsx   → hook tipado con los 4 themes
 *   - src/components/hooks/themeProvider.tsx → wrapper de next-themes
 *   - src/components/atoms/ThemeSwitcher.tsx → UI para elegir paleta
 *   - src/components/atoms/ThemeToggle.tsx → icono de toggle dark/light
 *   - src/app/layout.tsx                  → monta <ThemeProvider> en el layout raíz
 */

export type Theme = "light" | "dark" | "rosepine-dark" | "rosepine-light";

export type ThemeToken =
  // Backgrounds (jerarquía shadcn: en dark bg<card<pop; en light pop<card<bg)
  | "background"
  | "background-foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  // Brand
  | "primary"
  | "primary-foreground"
  | "primary-soft"
  | "primary-container"
  | "primary-container-foreground"
  // Estructura
  | "secondary"
  | "secondary-foreground"
  | "tertiary"
  | "tertiary-foreground"
  // Muted
  | "muted"
  | "muted-foreground"
  // Accent
  | "accent"
  | "accent-foreground"
  // Semánticos
  | "destructive"
  | "destructive-foreground"
  | "destructive-soft"
  | "warning"
  | "warning-foreground"
  | "warning-soft"
  | "success"
  | "success-foreground"
  | "success-soft"
  // Bordes
  | "border"
  | "border-foreground"
  | "border-glow"
  | "input"
  | "ring"
  // Interacción
  | "hover"
  | "pressed"
  // Texto
  | "foreground"
  | "footer"
  | "grid"
  // Highlighters
  | "highlight-low"
  | "highlight-med"
  | "highlight-high"
  // Rosepine palette
  | "love"
  | "pine"
  | "foam"
  | "iris";

/**
 * Utilidades Tailwind v4 generadas por @theme en globals.css.
 * SIEMPRE usá estas en componentes — nunca hardcoded.
 */
export type TailwindUtility =
  // Backgrounds
  | "bg-background"
  | "bg-card"
  | "bg-popover"
  | "bg-primary"
  | "bg-primary-soft"
  | "bg-primary-container"
  | "bg-secondary"
  | "bg-tertiary"
  | "bg-muted"
  | "bg-accent"
  | "bg-destructive"
  | "bg-destructive-soft"
  | "bg-warning"
  | "bg-warning-soft"
  | "bg-success"
  | "bg-success-soft"
  // Text
  | "text-foreground"
  | "text-muted-foreground"
  | "text-primary"
  | "text-primary-foreground"
  | "text-destructive"
  | "text-destructive-foreground"
  | "text-warning"
  | "text-warning-foreground"
  | "text-success"
  | "text-success-foreground"
  | "text-foreground-muted"
  // Borders
  | "border"
  | "border-border"
  | "border-primary"
  | "border-destructive"
  | "border-success"
  | "border-ring"
  // Ring
  | "ring-1"
  | "ring-primary"
  | "ring-warning"
  | "ring-destructive"
  // Hover
  | "hover:bg-primary"
  | "hover:border-primary"
  | "hover:text-primary"
  | "hover:bg-hover"
  | "hover:ring-primary";

/**
 * Convenciones CRÍTICAS — errores que ya cometimos y el usuario marcó:
 *
 * ❌ `border` solo (sin variant)
 * ✓  `border border-border` (ancho + color juntos)
 *
 * ❌ `text-background` (confundido con bg)
 * ✓  `text-foreground` o `text-primary-foreground`
 *
 * ❌ `bg-border` (no existe)
 * ✓  `bg-muted`
 *
 * ❌ `text-body` (no existe)
 * ✓  `text-muted-foreground`
 *
 * ❌ `text-wrap: balance` (typo)
 * ✓  `text-wrap-balance`
 *
 * ❌ `border bordear-subtle` (typo)
 * ✓  `border`
 *
 * ❌ `border border border-glow` (triple border)
 * ✓  `border border-glow` (ancho + color juntos)
 *
 * ❌ `text-white` hardcoded
 * ✓  `text-primary-foreground`
 *
 * ❌ `bg-slate-900/50` (Tailwind hardcoded)
 * ✓  `bg-popover`
 */
export const themingConventions = {
  borderWithColor: "border border-border",
  textPrimary: "text-foreground",
  textOverPrimary: "text-primary-foreground",
  bgSkeleton: "bg-muted",
  textSkeleton: "text-muted-foreground",
  badgePrimary: "bg-primary-soft text-primary ring-1 ring-primary/40",
  badgeWarning: "bg-warning-soft text-warning ring-1 ring-warning/40",
  badgeDestructive:
    "bg-destructive-soft text-destructive ring-1 ring-destructive/40",
  badgeSuccess: "bg-success-soft text-success ring-1 ring-success/40",
} as const;

/**
 * Helper de runtime — usar para validar que cualquier utility existe en @theme.
 * Útil cuando un componente usa utility dinámica.
 */
export const ALL_TAILWIND_UTILITIES: TailwindUtility[] = [
  "bg-background",
  "bg-card",
  "bg-popover",
  "bg-primary",
  "bg-primary-soft",
  "bg-primary-container",
  "bg-secondary",
  "bg-tertiary",
  "bg-muted",
  "bg-accent",
  "bg-destructive",
  "bg-destructive-soft",
  "bg-warning",
  "bg-warning-soft",
  "bg-success",
  "bg-success-soft",
  "text-foreground",
  "text-muted-foreground",
  "text-primary",
  "text-primary-foreground",
  "text-destructive",
  "text-destructive-foreground",
  "text-warning",
  "text-warning-foreground",
  "text-success",
  "text-success-foreground",
  "border",
  "border-border",
  "border-primary",
  "border-destructive",
  "border-success",
  "ring-1",
  "ring-primary",
  "ring-warning",
  "ring-destructive",
];
