---

type: guide
status: active
created: 2026-11-09
tags: [theming, palette, recipe, css, nextjs]
---

# Agregar una paleta nueva

Receta completa para agregar una paleta (ejemplo: `ocean`). Son **8 pasos en 5
archivos**. El paso 7 es el que se olvida siempre, y es el que hace que la
paleta nueva no funcione en el primer paint.

---

## Resumen

| #   | Archivo                                  | Que hacer                                                   |
| --- | ---------------------------------------- | ----------------------------------------------------------- |
| 1   | `src/app/globals.css`                    | Nuevo bloque `.ocean { ... }` con las **45** variables      |
| 2   | `src/app/globals.css`                    | `@theme` **solo** si la paleta introduce un token nuevo     |
| 3   | `src/components/hooks/theming.v2.ts`     | Agregar `"ocean"` al tipo `Theme`                           |
| 4   | `src/components/hooks/useTheme.tsx`      | Agregar `"ocean"` al tipo `Theme` y `"Ocean"` a `ThemeData` |
| 5   | `src/components/hooks/themeProvider.tsx` | Agregar `"ocean"` al array `themes`                         |
| 6   | `src/app/layout.tsx`                     | Agregar `"ocean"` al array `themes` del `ThemeProvider`     |
| 7   | `src/app/layout.tsx`                     | Agregar `"ocean"` al array `v` de la `ANTI_FOUC_SCRIPT`     |
| 8   | `src/components/atoms/ThemeSwitcher.tsx` | **No cambia**: el menu se arma desde `ThemeData`            |

`ThemeSwitcher.tsx` se verifica en el paso 8: lee `ThemeData` y hace
`cat.toLowerCase() as Theme`, asi que el label tiene que bajar exactamente a
`"ocean"`.

---

## Paso 1 — El bloque de la paleta en `globals.css`

Cada paleta define **las mismas 45 variables**. La forma mas segura de
empezar es copiar el bloque de una paleta existente y cambiar los valores.

`src/app/globals.css`, bloques de paleta actuales:

| Bloque            | Lineas aprox. |
| ----------------- | ------------- |
| `.dark`           | 96-165        |
| `.light`          | 167-232       |
| `.rosepine-dark`  | 234-298       |
| `.rosepine-light` | 301-362       |

El bloque nuevo va **despues** de `.rosepine-light` y **antes** de la seccion
`Background FX` (que arranca en la linea ~364 con `/* Background FX */`).

```css
/* ===========================================
   Ocean — paleta nueva
   =========================================== */
.ocean {
  --background: #0b1d2a;
  --background-foreground: #d7e6f0;

  --card: #12293a;
  --card-foreground: #d7e6f0;

  --popover: #17364b;
  --popover-foreground: #d7e6f0;

  --primary: #4cc3e0;
  --primary-foreground: #0b1d2a;
  --primary-soft: rgba(76, 195, 224, 0.1);
  --primary-container: rgba(76, 195, 224, 0.18);
  --primary-container-foreground: #d7e6f0;

  --secondary: #143044;
  --secondary-foreground: #d7e6f0;

  --tertiary: #1e4a63;
  --tertiary-foreground: #d7e6f0;

  --muted: #143044;
  --muted-foreground: #9db8c9;

  --accent: #4cc3e0;
  --accent-foreground: #0b1d2a;

  --destructive: #ff6b6b;
  --destructive-foreground: #0b1d2a;
  --destructive-soft: rgba(255, 107, 107, 0.1);

  --warning: #f0b429;
  --warning-foreground: #0b1d2a;
  --warning-soft: rgba(240, 180, 41, 0.1);

  --success: #3ddc97;
  --success-foreground: #0b1d2a;
  --success-soft: rgba(61, 220, 151, 0.1);

  --border: rgba(155, 197, 220, 0.12);
  --border-foreground: rgba(155, 197, 220, 0.18);
  --border-glow: rgba(76, 195, 224, 0.3);
  --input: rgba(155, 197, 220, 0.15);
  --ring: rgba(76, 195, 224, 0.4);

  --hover: rgba(76, 195, 224, 0.06);
  --pressed: rgba(76, 195, 224, 0.12);

  --foreground: #d7e6f0;
  --footer: #7fa6bd;
  --grid: #4cc3e02e;

  --highlight-low: #143044;
  --highlight-med: #1e4a63;
  --highlight-high: #2b6382;

  --love: #ff7b9c;
  --pine: #2a9d8f;
  --foam: #9be9e0;
  --iris: #a78bfa;
}
```

Ese bloque tiene **45 variables**: las mismas que las otras 4 paletas.

### Como verificar el conteo

```bash
grep -c '^\s*--' src/app/globals.css   # total del archivo, no por bloque
```

Para contar las del bloque nuevo, con el rango de lineas del bloque:

```bash
sed -n '/^\.ocean {/,/^}/p' src/app/globals.css | grep -c '^\s*--'
```

Tiene que dar **45**, igual que cualquier otra paleta.

### Reglas de los valores

- **Los 45 nombres son fijos.** No se agrega ni se saca ninguno. Si falta uno,
  la paleta hereda el valor de la paleta anterior y se ven colores raros.
- **`--primary-foreground` no es siempre `#fff`.** Es el color del texto
  **sobre** el primary. Si el primary de tu paleta es claro (como el
  `#ebbcba` de rosepine-dark), el foreground es oscuro (`#191724`). Si el
  primary es oscuro, el foreground es `#fff`.
- **`--*-soft` son rgba con alpha bajo** (~0.1). Son los fondos sutiles.
- **Los roles semanticos** (`destructive`, `warning`, `success`) tienen su
  trio: color, foreground y soft.
- **Los roles de Rosepine** (`love`, `pine`, `foam`, `iris`) se mantienen
  aunque la paleta no sea de Rosepine.

---

## Paso 2 — `@theme` (solo si hay un token nuevo)

`@theme` (lineas 17-91 de `globals.css`) es lo que expone las variables como
utilities de Tailwind:

```css
@theme {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... */
}
```

**Si la paleta nueva reusa los tokens que ya existen, no se toca `@theme`.**
Es el caso normal: `ocean` usa los mismos 45 roles que las otras paletas, asi
que `bg-background`, `text-foreground`, `bg-primary` ya funcionan.

Solo se toca `@theme` si la paleta introduce un token que **no** existe
todavia. Si ese es el caso, hay que hacer las tres cosas:

1. Agregar `--color-<token>: var(--<token>);` en `@theme`.
2. Agregar `--<token>: <valor>;` en el bloque de la paleta nueva.
3. Agregar el token en las **4** paletas existentes (para no romperlas).

Y sumarlo al tipo `ThemeToken` de `theming.v2.ts`.

---

## Paso 3 — El tipo `Theme` en `theming.v2.ts`

`src/components/hooks/theming.v2.ts:24`:

```ts
export type Theme = "light" | "dark" | "rosepine-dark" | "rosepine-light";
```

Passa a:

```ts
export type Theme =
  | "light"
  | "dark"
  | "rosepine-dark"
  | "rosepine-light"
  | "ocean";
```

> **El formato importa**: Biome rompe el union type en varias lineas cuando
> pasa de 80 caracteres. Con los 4 valores originales la union entra en una
> sola linea; al agregar el quinto, hay que pasarla a multilinea o
> `bun run lint` falla con "Formatter would have printed the following
> content". La forma de arriba es la que Biome produce.
>
> Si preferis escribirlo en una linea, corré `bunx biome check --write src/`
> y deja que Biome lo reformatee.
>
> Lo mismo pasa con el union de `useTheme.tsx` (paso 4a).
>
> `theming.v2.ts` no se importa en ningun componente: es documentacion
> ejecutable (el propio archivo lo dice). Sirve para que Graphify trace el
> sistema de theming. Igual hay que actualizarlo: si queda desactualizado, la
> documentacion del grafo miente.

---

## Paso 4 — El tipo `Theme` y los labels en `useTheme.tsx`

`src/components/hooks/useTheme.tsx` tiene **dos** lugares que hay que tocar.

**4a. El tipo `Theme`** (linea 6):

```ts
export type Theme = "light" | "dark" | "rosepine-dark" | "rosepine-light";
```

Passa a:

```ts
export type Theme =
  | "light"
  | "dark"
  | "rosepine-dark"
  | "rosepine-light"
  | "ocean";
```

**4b. El array `ThemeData`** (lineas 8-13):

```ts
export const ThemeData: string[] = [
  "Light",
  "Dark",
  "Rosepine-Dark",
  "Rosepine-Light",
  "Ocean",
];
```

### La regla del label

`ThemeSwitcher` hace:

```tsx
{ThemeData.map((cat) => (
  <Button onClick={() => setTheme(cat.toLowerCase() as Theme)} ... />
))}
```

El label se pasa por `toLowerCase()`, asi que:

| Label en `ThemeData`     | `toLowerCase()` | Estado                                        |
| ------------------------ | --------------- | --------------------------------------------- |
| `"Ocean"`                | `"ocean"`       | Correcto                                      |
| `"Ocean-Dark"`           | `"ocean-dark"`  | Correcto                                      |
| `"OCEAN"`                | `"ocean"`       | Funciona, pero rompe el estilo de labels      |
| `"Ocean "` (con espacio) | `"ocean "`      | **Roto**: el espacio va al nombre de la clase |

La convencion del archivo es `Label` con mayuscula inicial y guiones entre
palabras (`"Rosepine-Dark"`). Segui esa.

### 4c. La resolucion del tema actual

El mismo archivo tiene un `useEffect` + un ternario que **valida** el tema
resuelto contra una lista de valores conocidos:

```ts
const currentTheme: Theme =
  mounted &&
  (resolvedTheme === "dark" ||
    resolvedTheme === "light" ||
    resolvedTheme === "rosepine-dark" ||
    resolvedTheme === "rosepine-light")
    ? resolvedTheme
    : "rosepine-dark";
```

Si no se agrega `"ocean"` a esa comparacion, el hook **no reporta** `ocean`
como tema actual: cae al fallback. El `setTheme("ocean")` sigue funcionando
(la clase CSS se aplica igual), pero cualquier componente que lea `theme`
para decidir algo va a ver el valor equivocado.

Agregalo:

```ts
const currentTheme: Theme =
  mounted &&
  (resolvedTheme === "dark" ||
    resolvedTheme === "light" ||
    resolvedTheme === "rosepine-dark" ||
    resolvedTheme === "rosepine-light" ||
    resolvedTheme === "ocean")
    ? resolvedTheme
    : "rosepine-dark";
```

---

## Paso 5 — El array `themes` del `themeProvider`

`src/components/hooks/themeProvider.tsx:16`:

```tsx
<NextThemesProvider
  {...props}
  enableSystem={false}
  defaultTheme="rosepine-dark"
  forcedTheme={undefined}
  themes={["light", "dark", "rosepine-dark", "rosepine-light"]}
>
```

Passa a:

```tsx
  themes={["light", "dark", "rosepine-dark", "rosepine-light", "ocean"]}
```

> Este wrapper **fuerza** `enableSystem`, `defaultTheme` y `themes` **despues**
> del `{...props}`. Es decir: los props que llegan del `layout.tsx` para esos
> tres campos se ignoran. Por eso los pasos 5 y 6 tienen que hacer los dos:
> el del provider es el que manda, y el del layout es el que documenta la
> intención y mantiene el `layout.tsx` legible por si el wrapper cambia.

---

## Paso 6 — El array `themes` del `layout.tsx`

`src/app/layout.tsx:51`:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="rosepine-dark"
  enableSystem={false}
  themes={["light", "dark", "rosepine-dark", "rosepine-light"]}
  disableTransitionOnChange
>
```

Passa a:

```tsx
  themes={["light", "dark", "rosepine-dark", "rosepine-light", "ocean"]}
```

---

## Paso 7 — La `ANTI_FOUC_SCRIPT` (el paso que se olvida)

`src/app/layout.tsx:30`:

```ts
const ANTI_FOUC_SCRIPT = `(function(){try{var k=localStorage.getItem('theme');var c=document.documentElement;var v=['light','dark','rosepine-dark','rosepine-light'];if(k&&v.indexOf(k)>-1){c.classList.remove.apply(c.classList,v);c.classList.add(k);}else{c.classList.add('rosepine-dark');}}catch(e){}})();`;
```

El array `v` tiene dos funciones:

1. **Lista blanca**: `v.indexOf(k)>-1` decide si el valor guardado en
   `localStorage` es una paleta valida. Si `"ocean"` no esta en `v`, el
   `if` da falso y el script cae al `else`.
2. **Lista de clases a remover**: `c.classList.remove.apply(c.classList,v)`
   saca todas las paletas anteriores antes de aplicar la nueva.

Hay que agregar `"ocean"` en los dos papeles:

```ts
const ANTI_FOUC_SCRIPT = `(function(){try{var k=localStorage.getItem('theme');var c=document.documentElement;var v=['light','dark','rosepine-dark','rosepine-light','ocean'];if(k&&v.indexOf(k)>-1){c.classList.remove.apply(c.classList,v);c.classList.add(k);}else{c.classList.add('rosepine-dark');}}catch(e){}})();`;
```

### Que pasa si se olvida

Sin este paso:

- El `localStorage` guarda `"ocean"` (el `next-themes` si lo hace bien).
- El script anti-FOUC no lo reconoce: `v.indexOf("ocean")` es `-1`.
- En el primer paint se aplica el `else`: `rosepine-dark`.
- Cuando React hidrata, `next-themes` aplica `ocean` y la pagina **cambia de
  color sola**.

Eso es el flash de tema: un salto visible de `rosepine-dark` a `ocean` en cada
carga de pagina. En una paleta clara-vs-oscura es muy notorio.

### El `else` es el tema por defecto

El `else{c.classList.add('rosepine-dark')}` es el fallback cuando no hay
preferencia guardada. **Si cambias el tema por defecto del proyecto, tenes que
cambiar tambien este `else`** (y el `defaultTheme` del `layout.tsx` y del
`themeProvider.tsx`).

Por defecto, en el template, el tema por defecto esta en tres lugares:

| Lugar                                | Valor           |
| ------------------------------------ | --------------- |
| `layout.tsx` (`defaultTheme`)        | `rosepine-dark` |
| `themeProvider.tsx` (`defaultTheme`) | `rosepine-dark` |
| `ANTI_FOUC_SCRIPT` (el `else`)       | `rosepine-dark` |

Los tres coinciden. Si cambias uno, cambialos los tres.

---

## Paso 8 — `ThemeSwitcher.tsx`: no hay que tocarlo

Verificado: `src/components/atoms/ThemeSwitcher.tsx` arma el menu desde
`ThemeData`:

```tsx
{ThemeData.map((cat) => (
  <Button
    onClick={() => setTheme(cat.toLowerCase() as Theme)}
    key={cat}
    txt={cat}
    ...
  />
))}
```

No tiene una lista propia de paletas: hereda de `ThemeData`. Con el paso 4b
hecho, la paleta nueva aparece sola en el menu.

> Lo mismo para `ThemeToggle.tsx`: alterna entre `"dark"` y `"light"` fijo, no
> recorre la lista de paletas. Si se quiere que el toggle tambien recorra
> `ocean`, hay que cambiarlo a proposito.

---

## Verificacion

```bash
# 1. El bloque nuevo tiene 45 variables
sed -n '/^\.ocean {/,/^}/p' src/app/globals.css | grep -c '^\s*--'

# 2. TypeScript compila
bunx tsc --noEmit

# 3. Lint limpio
bun run lint

# 4. Build
bun run build
```

Y en el navegador:

1. Abrir el menu de paletas: la nueva tiene que aparecer.
2. Elegirla: la pagina cambia de color.
3. **Recargar** (F5): la pagina tiene que seguir en la paleta nueva **sin
   parpadear**. Si parpadea, falta el paso 7.
4. Cambiar a otra paleta y recargar de nuevo: no tiene que quedar ninguna clase
   vieja en el `<html>`.

Para ver las clases aplicadas:

```js
document.documentElement.className;
```

---

## Checklist

- [ ] Bloque `.ocean` con 45 variables en `globals.css`
- [ ] `@theme` actualizado **solo** si hay token nuevo (y en las 4 paletas)
- [ ] `"ocean"` en el tipo `Theme` de `theming.v2.ts`
- [ ] `"ocean"` en el tipo `Theme` de `useTheme.tsx`
- [ ] `"Ocean"` en `ThemeData` de `useTheme.tsx`
- [ ] `"ocean"` en la comparacion de `resolvedTheme` de `useTheme.tsx`
- [ ] `"ocean"` en el array `themes` de `themeProvider.tsx`
- [ ] `"ocean"` en el array `themes` del `layout.tsx`
- [ ] `"ocean"` en el array `v` de la `ANTI_FOUC_SCRIPT`
- [ ] `tsc --noEmit`, `bun run lint`, `bun run build` pasan
- [ ] Recarga sin flash de tema

---

## Archivos del sistema de theming

| Archivo                                  | Rol                                      |
| ---------------------------------------- | ---------------------------------------- |
| `src/app/globals.css`                    | `@theme` + las 4 paletas + background FX |
| `src/app/layout.tsx`                     | `ThemeProvider` + `ANTI_FOUC_SCRIPT`     |
| `src/components/hooks/themeProvider.tsx` | Wrapper de `next-themes`                 |
| `src/components/hooks/useTheme.tsx`      | Hook tipado + `ThemeData` (los labels)   |
| `src/components/hooks/theming.v2.ts`     | Tipos y convenciones (documentacion)     |
| `src/components/atoms/ThemeSwitcher.tsx` | Menu de paletas                          |
| `src/components/atoms/ThemeToggle.tsx`   | Toggle rapido dark/light                 |

Ver tambien: `docs/theming/README.md` (el sistema completo) y
`docs/decisions/` (por que existen las paletas y no themes bespoke).
