# nextjs-template

Template de Next.js 16 con las decisiones técnicas ya tomadas: atomic design,
theming con 4 paletas, animaciones, validación con Zod y datos estáticos o
Supabase intercambiables sin tocar una línea de JSX.

Está pensado para arrancar un proyecto nuevo sin volver a discutir package
manager, estructura de componentes ni sistema de temas.

---

## Propósito

Cada proyecto nuevo arranca con las mismas veinte decisiones tomadas a mano:
qué package manager, cómo se organizan los componentes, cómo se manejan los
temas, cómo se validan los datos. Este template las congela en un punto de
partida para que el trabajo real empiece en el dominio del producto, no en el
andamiaje.

## Objetivos

- **Arrancar en minutos.** Clone, `bun install`, `bun run dev`. Sin base de
  datos, sin credenciales, sin configuración obligatoria.
- **Un solo stack, sin alternativas.** Bun, Biome, Tailwind v4, Motion, Zod.
  No hay ESLint, no hay framer-motion, no hay npm.
- **Cambiar de fuente de datos sin refactorizar.** Los componentes no saben si
  el contenido viene de un JSON local o de Supabase.
- **Un tema que funciona.** 4 paletas coordinadas, un solo lugar donde se
  declaran los colores, y un switch de tema sin flashes.
- **Documentado desde el día uno.** Cada sistema tiene su carpeta en `docs/`
  con su índice.

---

## Features

| Sistema                    | Qué resuelve                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 App Router**  | Server Components por defecto, route groups `(admin)`, layouts anidados                                              |
| **React 19**               | Server Components, `use client` acotado a la hoja más baja                                                           |
| **TypeScript estricto**    | `strict: true`, path alias `@/*`, sin `any`                                                                          |
| **Bun**                    | `bun.lock`, `bun install`, `bun run dev`. Sin npm ni pnpm                                                            |
| **Biome**                  | Lint + format + assist en un solo binario. Dominios de Next y React                                                  |
| **Tailwind v4**            | `@theme` como única fuente de verdad de color y tipografía                                                           |
| **Theming v2**             | 4 paletas (`.light`, `.dark`, `.rosepine-dark`, `.rosepine-light`) con 45 variables CSS cada una. Anti-FOUC incluido |
| **Motion**                 | `LazyMotion` + `m` (4.6 KB), primitivas de reveal y stagger, `AnimatePresence` para salidas                          |
| **Atomic design**          | `atoms/` → `molecules/` → `organisms/`, un componente por archivo, barrel exports                                    |
| **Zod**                    | Validación en el borde: todo payload se valida antes de llegar a un componente                                       |
| **Data dual**              | Modo estático (JSON local) o Supabase (RPC). La misma forma de salida en ambos                                       |
| **Supabase SSR**           | Clientes de servidor, browser y middleware, con refresco de sesión                                                   |
| **Auth**                   | Login, OAuth (Google), callback, route group `(admin)` protegido por rol                                             |
| **Formulario de contacto** | `react-hook-form` + `zodResolver` + EmailJS                                                                          |
| **Skeletons**              | Uno por sección, siempre presentes junto a `error.tsx` y `loading.tsx`                                               |
| **i18n por query param**   | `?lang=es` / `?lang=en`, con un JSON por idioma                                                                      |
| **Iconos SVG inline**      | Registro tipado con schema Zod, sin dependencia de librería de iconos                                                |
| **Graphify**               | Grafo de dependencias del código, generado local y no trackeado                                                      |

---

## Quick start

```bash
# 1. Clonar
git clone https://github.com/Below-Z3R0/nextjs-template.git mi-proyecto
cd mi-proyecto

# 2. Instalar
bun install

# 3. Configurar
cp .env.example .env.local

# 4. Levantar
bun run dev
```

Abrí `http://localhost:3000`. El sitio arranca con los datos de ejemplo en
`src/services/data/static/`, sin base de datos y sin credenciales.

> Si `bun` no está en el PATH de tu shell, usá `~/.bun/bin/bun`.

### Elegir el origen de los datos

El `.env.local` controla de dónde sale el contenido:

```bash
# Modo estático: lee los JSON de src/services/data/static/
DATA_SOURCE=static
```

```bash
# Modo Supabase: lee de la RPC get_site_payload
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-proyecto
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
```

Sin `DATA_SOURCE` definido, el template usa Supabase **solo** si encuentra
credenciales cargadas; si no, cae al modo estático. Nunca se rompe por falta de
configuración.

Para levantar el modo Supabase:

1. Crear el proyecto en Supabase.
2. Copiar las credenciales al `.env.local`.
3. En el Dashboard → SQL Editor, correr `setup-database.sql` (crea las tablas
   `languages`, `content_blocks`, `content_blocks_metadata`, `translations`,
   `profiles`, las policies y la función `get_site_payload`).
4. Cambiar `DATA_SOURCE=supabase` y reiniciar el dev server.

El resto de las variables del `.env.example` es opcional:

| Variable                                                          | Para qué                                            |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` / `_TEMPLATE_ID` / `_PUBLIC_KEY` | Envío del formulario de contacto por EmailJS        |
| `NEXT_PUBLIC_SITE_URL`                                            | URL base del sitio, usada en los redirects de OAuth |

---

## Arquitectura

### Las dos carpetas de un proyecto

Un proyecto creado desde este template separa las reglas del código en dos
capas:

```
Mi-Proyecto/              ← CAPA AGENTE (primera letra MAYÚSCULA)
├── .hermes.md            ← reglas operativas para la IA
├── AGENTS.md             ← entry point para agentes
├── README.md             ← documentación para humanos
├── CHANGELOG.md          ← historial de cambios
├── .scratch/             ← temporales de trabajo
└── mi-proyecto/          ← CAPA CÓDIGO (siempre en minúscula)
    ├── src/
    ├── docs/
    ├── public/
    ├── package.json
    ├── biome.json
    └── bun.lock
```

La carpeta de código nunca lleva archivos de agente. El output de Graphify va
en `docs/graphify/` dentro de la carpeta de código, y no se trackea en git.

### Flujo de datos

Un solo lugar pide datos. Después, cada componente recibe props tipadas:

```
src/app/page.tsx                 (orquestador, Server Component)
  │
  ├─ getSiteData(lang)           src/services/data/site.ts
  │    ├─ fetchFromStatic()      JSON local  ─┐
  │    └─ fetchFromSupabase()    RPC          ─┴─ misma forma de salida
  │         │
  │         └─ validación Zod    falla ruidoso si el payload no cumple
  │
  └─ props tipadas
       └─ organisms/             Header, HeroSection, SkillsSection, ProjectsSection...
            └─ molecules/        NavBar, ProjectCard, Formulary, Modal...
                 └─ atoms/       Button, Title1..4, Span, Paragraph, IconRender...
```

Los dos modos de datos devuelven exactamente el mismo payload, así que ningún
componente sabe de dónde vino la información. Cambiar de JSON a Supabase no
toca JSX.

### Atomic design

Tres niveles, una sola dirección de dependencia:

```
  ┌─────────────────────────────────────────────────────────┐
  │  organisms/          Secciones completas de la página   │
  │  HeroSection · SkillsSection · ProjectsSection ·        │
  │  ContactSection · Header · Footer                       │
  │  Reciben props tipadas. No hacen fetch.                 │
  └───────────────────────────┬─────────────────────────────┘
                              │  importa
  ┌───────────────────────────▼─────────────────────────────┐
  │  molecules/           Composiciones con estado          │
  │  NavBar · ProjectCard · Formulary · Modal ·             │
  │  TecnologiesCard · SuccessMessage · ErrorMessage        │
  └───────────────────────────┬─────────────────────────────┘
                              │  importa
  ┌───────────────────────────▼─────────────────────────────┐
  │  atoms/              Primitivas visuales               │
  │  Button · LinkButton · Title1..4 · Span · Paragraph ·  │
  │  IconRender · ThemeSwitcher · ThemeToggle               │
  │  Sin lógica de negocio. Sin datos de la base.           │
  └─────────────────────────────────────────────────────────┘
```

`organisms → molecules → atoms`. Nunca al revés. Todo se exporta desde
`src/components/components.ts`, que es la API pública del sistema de diseño.

### Theming: 4 paletas, 45 variables

Los colores se declaran **una sola vez** en `src/app/globals.css`. Cada
paleta define las mismas 45 variables CSS; las utilities de Tailwind leen
esas variables, así que cambiar de paleta repinta todo el sitio sin tocar un
componente.

```
                    src/app/globals.css
                            │
                  ┌─────────┴─────────┐
                  │       @theme       │
                  │  --color-background │
                  │  --color-primary    │   ← expone las variables
                  │  --color-border     │      como utilities de Tailwind
                  │  ... 45 tokens ...  │      (bg-background, text-primary...)
                  └─────────┬─────────┘
                            │
     ┌──────────┬───────────┼───────────┬──────────┐
     ▼          ▼           ▼           ▼          │
  .dark      .light   .rosepine-dark  .rosepine-light
     │          │           │           │          │
  45 vars     45 vars      45 vars      45 vars
     │          │           │           │
     └──────────┴─────┬─────┴───────────┘
                      │
              next-themes (attribute="class")
              aplica la clase en <html>
                      │
                      ▼
              .dark { --background: #000000; ... }
```

La clase se aplica sobre `<html>`, y un script anti-FOUC la define antes del
primer paint para que no haya un flash del tema por defecto.

Para agregar un token nuevo hay que tocar tres lugares: las 4 paletas, el
`@theme` y el tipo `ThemeToken` en `src/components/hooks/theming.v2.ts`. Las
clases de color nunca se hardcodean: `text-foreground`, `bg-muted`,
`border-border`, `text-primary-foreground`.

---

## Cómo se organiza el código

```
src/
├── app/
│   ├── layout.tsx              Layout raíz: fuentes, ThemeProvider, anti-FOUC, LazyMotion
│   ├── page.tsx                Orquestador de la home
│   ├── globals.css             Theming v2: @theme + las 4 paletas
│   ├── error.tsx               UI de error centralizada
│   ├── loading.tsx             Skeleton de página
│   ├── login/                  Pantalla de login
│   ├── auth/
│   │   ├── callback/route.ts   Callback de OAuth
│   │   └── route/page.tsx      Destino post-login según rol
│   └── (admin)/                Route group protegido por rol admin
│       ├── layout.tsx          Verifica sesión y rol
│       └── admin/              Panel (placeholder para reemplazar)
│
├── components/
│   ├── components.ts           Barrel: API pública del sistema de diseño
│   ├── types.ts                Contratos de props
│   ├── schemas.ts              Schemas Zod + tipos del dominio
│   ├── atoms/                  14 primitivas visuales
│   ├── molecules/              7 composiciones con estado
│   ├── organisms/              10 secciones de página
│   ├── animations/             Primitivas de Motion
│   ├── hooks/                  ThemeProvider, useTheme, tipos de theming
│   └── skeletons/              Skeletons por sección
│
└── services/
    ├── env.ts                  Acceso a variables de entorno + switch de datos
    ├── site-url.ts             URL base del sitio
    ├── data/
    │   ├── site.ts             getSiteData, pickProjects, validación
    │   └── static/             site.es.json, site.en.json
    ├── assets/                 Iconos SVG, registro de iconos, image loader
    └── supabase/               Clientes server / browser / middleware
```

Las piezas que más se tocan:

| Quiero cambiar...          | Voy a...                                           |
| -------------------------- | -------------------------------------------------- |
| Los colores o la paleta    | `src/app/globals.css`                              |
| Los textos del sitio       | `src/services/data/static/site.*.json` (o la base) |
| Un componente              | `src/components/<nivel>/<Nombre>.tsx`              |
| Los tipos de un componente | `src/components/types.ts`                          |
| La validación de un bloque | `src/components/schemas.ts`                        |
| El origen de los datos     | `src/services/env.ts`                              |
| Una animación              | `src/components/animations/Animations.tsx`         |

---

## Preguntas iniciales obligatorias

Este template es una base, no un producto. Antes de escribir código en un
proyecto nuevo hay que responder cinco preguntas, porque la respuesta cambia
qué se personaliza del template:

| #   | Pregunta                                        | Qué define                                                                                                                                                                  |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ¿Supabase o data estática en JSON local?        | Si es estático, se borra `src/services/supabase/` y se carga el contenido real en los JSON. Si es Supabase, se corre `setup-database.sql` y se configuran las credenciales. |
| 2   | ¿Tiene i18n? ¿Qué idiomas?                      | Si no tiene, se simplifica el schema de traducciones y queda un solo idioma. Si tiene, se definen los `lang_code` y un JSON por idioma.                                     |
| 3   | ¿Cuáles son las paletas del tema?               | Las 4 del template, un subconjunto, o paletas propias. Cada paleta nueva tiene que definirse completa.                                                                      |
| 4   | ¿Tiene autenticación o panel de administración? | Si sí, se mantiene el route group `(admin)` con su control de rol. Si no, se borran `(admin)`, `login/`, `auth/` y el middleware.                                           |
| 5   | ¿Qué módulos o sistemas hay que documentar?     | Qué carpetas de `docs/` se crean. Cada módulo lleva su carpeta con su `README.md` índice.                                                                                   |

Las preguntas se hacen **antes** de arrancar porque el template se personaliza
según el tipo de proyecto. Un template listo desde el inicio evita rehacer la
base a mitad de camino.

---

## Comandos

```bash
bun install          # instalar dependencias
bun run dev          # servidor de desarrollo
bun run lint         # biome check
bun run format       # biome format --write
bun run build        # build de producción
bun run start        # servir el build
bunx tsc --noEmit    # typecheck
```

Si `bun` no está en el PATH: `~/.bun/bin/bun install`.

---

## Documentación

| Carpeta            | Qué cubre                                                               |
| ------------------ | ----------------------------------------------------------------------- |
| `docs/README.md`   | Índice general de la documentación                                      |
| `docs/components/` | Atomic design: los tres niveles, el barrel, client vs server, skeletons |
| `docs/theming/`    | Theming v2: las 4 paletas, cómo agregar una variable, convenciones      |
| `docs/motion/`     | Motion: `LazyMotion` + `m`, primitivas, patrones de reveal y stagger    |
| `docs/data/`       | Contrato de datos, modo estático vs Supabase, validación, cache         |
| `docs/services/`   | Capa de servicios: env, assets, clientes de Supabase                    |
| `docs/decisions/`  | Decisiones técnicas: qué se decidió, por qué y qué se descartó          |
| `docs/graphify/`   | Output del grafo de dependencias (generado, no se trackea)              |

La documentación describe el estado actual del código, no la historia. Los
nombres de archivo van en `kebab-case`, sin numeraciones ni fechas.

Dos archivos tienen readership distinto y no se mezclan:

- `README.md` (raíz) — para humanos: propósito, features, diagramas, cómo
  usarlo.
- `.hermes.md` — para la IA: reglas operativas, stack obligatorio, pitfalls
  conocidos.

---

## Stack

| Pieza        | Versión                |
| ------------ | ---------------------- |
| Next.js      | 16.4.5                 |
| React        | 19.3.1                 |
| TypeScript   | 7.0.2                  |
| Bun          | 1.4.4                  |
| Biome        | 2.6.6                  |
| Tailwind CSS | 4.3.5                  |
| Motion       | 14.10.1                |
| next-themes  | 0.4.6                  |
| Zod          | 4.6.7                  |
| Supabase     | `@supabase/ssr` 0.12.7 |

---

## Licencia

Template de uso interno. Reutilizable y adaptable.
