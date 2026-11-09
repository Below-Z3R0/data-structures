---

type: guide
status: active
created: 2026-11-09
tags: [template, nextjs, guide, onboarding, ai]
---

# Template guide — nextjs-template

> Auditoría de la documentación del template: qué está documentado, qué está
> a medias, qué falta, y qué puede resolver una IA nueva **solo con la doc**.

---

## Que es este template

Base de Next.js 16 con las decisiones de infraestructura ya tomadas (Bun, Biome,
Tailwind v4, Motion, Zod, atomic design, theming de 4 paletas, datos
intercambiables entre JSON local y Supabase). Se clona, se personaliza con las
cinco preguntas iniciales y se arranca a trabajar en el dominio.

---

## Mapa de los 10 sistemas

Estado de cada sistema frente a lo que una IA puede resolver **solo con la
documentación**:

| #   | Sistema                      | Estado      |
| --- | ---------------------------- | ----------- |
| 1   | Theming v2                   | PARCIAL     |
| 2   | Motion                       | DOCUMENTADO |
| 3   | Atomic design                | PARCIAL     |
| 4   | Data dual                    | DOCUMENTADO |
| 5   | Services                     | PARCIAL     |
| 6   | Skeletons y estados de carga | DOCUMENTADO |
| 7   | i18n                         | INCOMPLETO  |
| 8   | Route groups                 | INCOMPLETO  |
| 9   | Documentación del proyecto   | PARCIAL     |
| 10  | Tooling                      | PARCIAL     |

---

### 1. Theming v2 — PARCIAL

**Que hace y por que existe.** Sistema de temas con 4 paletas y 45 variables CSS
por paleta. Los componentes no saben que tema hay activo: usan utilities de
Tailwind (`bg-background`, `text-foreground`) y el CSS resuelve. Cambiar de
paleta repinta todo el sitio sin tocar un componente.

**Como se usa en el dia a dia.**

```tsx
// Un componente cualquiera. No sabe nada del tema.
<button className="bg-primary text-primary-foreground border border-border">
  Enviar
</button>;
```

El color sale de `src/app/globals.css:17-91` (`@theme` expone `--color-*: var(--*)`)
y del bloque de la paleta activa (`.dark` en `globals.css:96-162`,
`.light` en `167-229`, `.rosepine-dark` en `234-295`, `.rosepine-light` en
`301-362`).

**Como se mantiene.**

| Tarea              | Archivos                                                                                                                                                                                                                                  | Nota                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Agregar un token   | `globals.css` (4 paletas + `@theme`), `src/components/hooks/theming.v2.ts` (`ThemeToken`)                                                                                                                                                 | La doc lo dice bien: mismo token en las 4 paletas        |
| Agregar una paleta | `globals.css` (bloque nuevo), `theming.v2.ts` (`Theme` type), `src/components/hooks/useTheme.tsx` (`Theme` type + `ThemeData`), `src/components/hooks/themeProvider.tsx` (`themes`), `src/app/layout.tsx` (`themes` + `ANTI_FOUC_SCRIPT`) | **La doc NO dice qué archivos tocar.** Hay que derivarlo |
| Cambiar un color   | `globals.css`, solo el bloque de la paleta                                                                                                                                                                                                | Correcto: un valor, 4 paletas si es un token nuevo       |

**Reglas y trampas (documentadas en `docs/theming/README.md` y `.hermes.md`).**
`text-background`, `bg-border`, `text-body`, `text-wrap: balance` y
`bordear-subtle` no existen: compilan y no hacen nada. `text-primary-foreground`
nunca se hardcodea. `text-white` y `bg-slate-900/50` están prohibidos.
`border border border-glow` es triple borde. `transition: all` con `next-themes`
es catastrófico.

**Huecos concretos (por eso es PARCIAL y no DOCUMENTADO):**

1. **El número de variables es contradictorio.** `docs/theming/README.md:3` y
   `:26` dicen "36 variables". El código tiene **45** en cada paleta
   (verificado contando los `--token:` de `globals.css:98-161`), y 45 entradas
   en `ThemeToken` (`theming.v2.ts:26-88`). El `README.md` raíz y `.hermes.md`
   dicen 45 correctamente. La doc de `docs/theming/` está desactualizada: una IA
   que la lea espera 36 y va a notar que faltan 9.
2. **La regla de selectores está invertida respecto del código.**
   `docs/theming/README.md:63-75` presenta `:where()` como algo opcional para
   "aplicar vars a un subárbol" y dice que las paletas usan "selectores de clase
   directa (`.dark { ... }`)". El código real usa clase directa (correcto), pero
   el SOUL y `nextjs-template-patterns` marcan `:where(.dark, .dark body)` como
   **REGLA DURA**. Con `next-themes` 0.4.6 verificado en
   `node_modules/next-themes/dist/index.js`, la clase se aplica **siempre** a
   `document.documentElement` (`P=document.documentElement`), nunca al `body`:
   el caso "next-themes monta en `<body>`" que justifica el `:where()` no se
   da en esta versión. `.hermes.md:152-167` lo describe bien; `docs/theming/` lo
   describe como excepción, no como norma.
3. **No hay receta para agregar una paleta.** Es el hueco más caro del sistema
   (ver caso 1 abajo).
4. **Falta el valor por defecto.** El tema por defecto está en tres lugares y
   no coinciden entre sí: `layout.tsx:49` dice `defaultTheme="dark"`, pero
   `themeProvider.tsx:14` impone `defaultTheme="rosepine-dark"` **después** del
   spread `{...props}` (línea 15-16), así que el valor real es
   `rosepine-dark`. `useTheme.tsx:30` también cae a `"rosepine-dark"`. La
   `ANTI_FOUC_SCRIPT` (`layout.tsx:30`) sí usa `dark` como fallback. La doc no
   menciona que hay que tocar el script anti-FOUC al cambiar el default.

**Archivos que toca.** `src/app/globals.css`, `src/app/layout.tsx`,
`src/components/hooks/themeProvider.tsx`, `src/components/hooks/useTheme.tsx`,
`src/components/hooks/theming.v2.ts`, `src/components/atoms/ThemeSwitcher.tsx`,
`src/components/atoms/ThemeToggle.tsx`.

---

### 2. Motion — DOCUMENTADO

**Que hace y por que existe.** Animaciones de entrada y salida con `motion` v14
(`motion/react`), con el bundle acotado: `LazyMotion features={domAnimation}
strict` + el componente `m` (4.6 KB) en vez del bundle completo (30 KB).

**Como se usa en el dia a dia.**

```tsx
import { SectionReveal } from "@/components/animations/Animations";

<SectionReveal>
  <HeroSection hero_data={hero_data} />
</SectionReveal>;
```

Las primitivas disponibles (`docs/motion/README.md:27-39`) son `SectionReveal`,
`TextReveal`, `SlideReveal`, `StaggerGroup`, `StaggerItem`, `EyebrowReveal`,
`PopReveal`, `ExpandLine`, `LoadingDots`. Verificadas: las 9 existen en
`src/components/animations/Animations.tsx`.

**Como se mantiene.** Las variantes viven a nivel de modulo en
`Animations.tsx:22-58` (`sectionVariants`, `textVariants`,
`staggerContainerVariants`, `staggerItemVariants`). Una animación nueva se
agrega como variante de modulo + primitiva wrapper. `AnimatePresence` ya se usa
en `ErrorMessage.tsx:12`, `SuccessMessage.tsx:12` y `ProjectCard.tsx:123` para
las salidas.

**Reglas y trampas.** `motion.div` dentro de `LazyMotion strict` rompe el build
(usar `m`). `viewport={{ once: true }}` es obligatorio en las entradas, si no la
animación se repite. `StaggerItem` no define `initial` ni `whileInView`: hereda
del padre. Nunca `IntersectionObserver` manual. Nunca loops infinitos salvo
los controlados por `isLoading`. El `"use client"` va lo más bajo posible.

**Un hueco menor:** `docs/motion/README.md` no menciona que `Animations.tsx`
tiene `"use client"` en la línea 1, que es lo que hace que `SectionReveal` sea
usable desde un Server Component. No bloquea nada, pero la IA lo deduce.

**Archivos que toca.** `src/components/animations/Animations.tsx`,
`src/components/animations/animationsindex.ts`, `src/app/layout.tsx`
(montaje de `LazyMotion`).

---

### 3. Atomic design — PARCIAL

**Que hace y por que existe.** Tres niveles con una sola dirección de
dependencia: `organisms → molecules → atoms`. Un atom nunca importa una
molecule; un organism nunca hace fetch, recibe props tipadas.

**Como se usa en el dia a dia.**

```tsx
// organism: recibe props, compone molecules y atoms
export function HeroSection({ hero_data }: HeroSectionProps) {
  return (
    <StaggerGroup>
      <StaggerItem>
        <Title2 txt={hero_data.data.title} />
      </StaggerItem>
    </StaggerGroup>
  );
}
```

**Como se mantiene.** Cinco pasos, en `docs/components/README.md:85-91`:
definir nivel, props en `types.ts`, implementar, exportar desde
`components.ts`, agregar skeleton si es sección nueva.

**Reglas y trampas.** Un componente por archivo, named exports, props tipadas.
Un prop que describe _qué dato es_ y no _cómo se ve_ pertenece al organism, no
a la molecule. Server Components por defecto.

**Huecos concretos:**

1. **La regla de imports contradice el código.** `docs/components/README.md:39-40`
   dice "Los componentes internos usan imports directos (`../atoms/Button`) para
   no crear ciclos a traves del barrel". El código real hace lo contrario en la
   mayoría de los casos: 20 de 29 imports internos pasan por `"../components"`
   (el barrel). Solo 3 usan ruta directa: `TecnologiesCard.tsx:1`
   (`../atoms/IconRender`), `NavBar.tsx:1` (`../atoms/ThemeSwitcher`) y
   `ProjectsSection.tsx:3` (`../molecules/ProjectCard`). El propio barrel
   (`components.ts:2-3`) dice "Los componentes importan entre si desde
   './components'". `.hermes.md:256-258` repite el mismo texto de la doc, así
   que el error está replicado en las dos capas. Una IA que siga la doc va a
   reescribir imports que funcionan.
2. **Dos organisms no están en el barrel y no se usan en ningún lado:**
   `src/components/organisms/IASection.tsx` y `src/components/organisms/OSSection.tsx`.
   Ambos son copias casi idénticas de `ProjectsSection.tsx`. No aparecen en
   `components.ts` y `grep` no encuentra ningún consumidor. La doc no los
   menciona y el README raíz dice "10 secciones de página" contando los dos
   muertos (el conteo real de organisms en disco es 10, de los cuales 8 son
   reales).
3. **Los hooks están en el barrel de componentes.** `components.ts:25-26`
   exporta `hooks/themeProvider` y `hooks/useTheme`. La doc de components no lo
   menciona; no es un bug, pero ensucia la "API pública del sistema de diseño".
4. **Falta el criterio de "cómo sé si es atom, molecule u organism".** La doc
   dice "si dudas, es molecule", pero no da una prueba. En la práctica: atom =
   sin props de dominio; molecule = tiene estado o interacción; organism =
   corresponde a una sección de la página.

**Archivos que toca.** `src/components/<atoms|molecules|organisms>/<Nombre>.tsx`,
`src/components/types.ts`, `src/components/components.ts`,
`src/components/skeletons/<Nuevo>Skeleton.tsx` + `skeletonindex.tsx`.

---

### 4. Data dual — DOCUMENTADO

**Que hace y por que existe.** El sitio se alimenta de un payload con dos mapas:
`content` (textos traducibles) y `metadata` (datos no traducibles: imágenes,
links, flags). Los proyectos son dinámicos: se detectan por el prefijo
`project.` y se ordenan alfabéticamente por slug.

**Como se usa en el dia a dia.**

```ts
// El orquestador. Un solo lugar pide datos.
const { content, metadata } = await getSiteData(currentLang);
const projects = pickProjects({ content, metadata });
```

El switch vive en `src/services/env.ts:102-108` (`resolveDataSource()`):

```bash
DATA_SOURCE=static     # fuerza estático
DATA_SOURCE=supabase   # fuerza Supabase
```

Sin `DATA_SOURCE`, usa Supabase solo si hay credenciales cargadas
(`env.ts:63-68`), si no cae al JSON estático. Los dos modos devuelven
exactamente la misma forma, por eso cambiar de modo no toca una línea de JSX.

**Como se mantiene.**

| Tarea                     | Dónde                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Agregar un proyecto       | Bloque `project.<slug>` en `content` y en `metadata` del JSON (o filas en `content_blocks` / `translations` / `content_blocks_metadata` en Supabase). `pickProjects` lo toma solo (`site.ts:240-256`)                    |
| Agregar una sección nueva | Hoy no hay receta. Implica schema en `schemas.ts`, registro en `CONTENT_SCHEMAS`/`METADATA_SCHEMAS` (`site.ts:51-68`), tipo en `SiteContent`/`SiteMetadata` (`site.ts:69-88`), bloque en los JSON, y props en `page.tsx` |
| Cambiar los idiomas       | Duplicar `site.<lang>.json` + registrarlo en `STATIC_PAYLOADS` (`site.ts:177-180`); en Supabase, filas en `translations` con el `lang_code`                                                                              |
| Invalidar cache           | `revalidateTag("site:es")`. El cache es `unstable_cache` con `revalidate: 3600` y tag `site:<lang>` (`site.ts:225-234`), solo en producción                                                                              |

**Reglas y trampas.** Todo payload pasa por Zod antes de llegar a un componente
(`site.ts:109-177`); si un bloque no cumple, `getSiteData` lanza con la key y el
mensaje (`site.ts:113-124`). Las keys desconocidas que no sean `project.` se
ignoran. Los schemas Zod deben matchear el **snake_case** de la BD
(`is_relevant`, `link_github`), no inventar camelCase.

**Un hueco menor:** `docs/data/README.md` describe la metadata con
`"section.footer"` y `"section.projects"` en el ejemplo del payload
(`docs/data/README.md:21-27`), pero el código real **no tiene** metadata para
esos dos: `METADATA_SCHEMAS` (`site.ts:62-67`) solo define `section.hero`,
`general.contacts`, `section.skills`, `section.aboutme`. La tabla de ejemplo de
la doc no matchea el código. No rompe nada (el ejemplo es ilustrativo) pero
desorienta.

**Archivos que toca.** `src/services/data/site.ts`,
`src/services/data/static/site.<lang>.json`, `src/components/schemas.ts`,
`src/services/env.ts`, `setup-database.sql` (esquema de BD).

---

### 5. Services — PARCIAL

**Que hace y por que existe.** Capa de acceso a datos externos. Los componentes
no hablan con Supabase ni con el sistema de archivos: pasan por acá.

**Como se usa en el dia a dia.**

```ts
// Acceso tipado a env. SIEMPRE estático.
const url = supabaseEnv.url; // getter, no constante
```

La regla está bien explicada (`docs/services/README.md:22-40`) y es real:
`env.ts:44-90` expone getters con acceso literal a `process.env.X`, con
`MissingEnvError` si falta. El caso de aplicación es `emailJsEnv`, que se
consume en `Formulary.tsx:45-54`.

**Como se mantiene.** Un icono nuevo = SVG en `src/services/assets/Icons.tsx` +
entrada en `ICON_REGISTRY` (`icon-registry.ts:30-54`). El `IconNameSchema`
valida que la key exista, así que un JSON con `icon_key: "vue"` falla ruidoso.
Los tipos de Supabase se regeneran con el comando `supabase gen types` de la
doc.

**Reglas y trampas.** Acceso estático a `process.env` (con índice dinámico
`process.env[name]`, `process.env` llega vacío en el browser). El middleware
refresca la sesión en cada request. `server.ts` es para servidor, `client.ts`
para browser, `middleware.ts` para el refresh.

**Huecos concretos:**

1. **El image loader está documentado pero no está habilitado.**
   `docs/services/README.md:82-95` dice que `supabase-image-loader.ts` "se
   activa en `next.config.ts`" y muestra el bloque `images: { loader: "custom",
   loaderFile: ... }`. **`next.config.ts` no tiene ese bloque**: el archivo real
   tiene 4 líneas y solo `reactCompiler: true`. El loader es código muerto
   (grep: ninguna referencia). Una IA que siga la doc yynecesite las imágenes
   de Supabase Storage discovers que la config no está y no sabe si debe
   agregarla o si el template la eliminó a propósito.
2. **La tabla de archivos de `docs/services/README.md` está incompleta:** no
   lista `src/services/supabase/types/types.helper.ts` (que existe y tipa las
   filas de `content_blocks`, `translations`, `languages`, `profiles`).
3. **El comando de regeneración de tipos apunta al schema equivocado para este
   proyecto.** `docs/services/README.md:76-80` dice
   `--schema public`, y en este template el RPC vive en `public`
   (`setup-database.sql:106-129`, y `types.ts` tiene el schema `public`), así
   que acierta. Pero el `.hermes.md` no lo menciona y el README raíz tampoco.
   El caso "el proyecto usa un schema custom" está en la skill
   `nextjs-template-patterns` pero no en la doc del template: si alguien pasa
   el template a un schema `app` o `portfolio`, el RPC hay que agregarlo a mano
   a los types generados y eso no está escrito en ningún lado del repo.
4. **No se documenta el mapeo `image_key` → ruta.** El JSON guarda
   `"images/profile.png"` y los componentes hacen `src={`/${image_key}`}`
   (`HeroSection.tsx:17`, `AboutMeSection.tsx:24`), o sea, apuntan a
   `public/images/`. En Supabase el valor sería un path de Storage. La doc de
   assets dice "En modo estatico, las imagenes van en `public/images/` y se
   referencian como `/images/<archivo>`" pero no aclara el formato exacto del
   valor (con o sin `images/` adentro).

**Archivos que toca.** `src/services/env.ts`, `src/services/site-url.ts`,
`src/services/assets/Icons.tsx`, `src/services/assets/icon-registry.ts`,
`src/services/assets/supabase-image-loader.ts`, `src/services/supabase/*`,
`next.config.ts`, `setup-database.sql`.

---

### 6. Skeletons y estados de carga — DOCUMENTADO

**Que hace y por que existe.** Red de seguridad de la UX: mientras cargan los
datos o cuando fallan, el usuario ve una pantalla con estructura en vez de un
pantalla en blanco.

**Como se usa en el dia a dia.**

```tsx
// src/app/loading.tsx
import { HomePageSkeleton } from "@/components/skeletons/skeletonindex";
export default function Loading() {
  return <HomePageSkeleton />;
}
```

**Como se mantiene.** Un skeleton por sección en `src/components/skeletons/`,
todos indexados desde `skeletonindex.tsx`. `error.tsx` y `loading.tsx` existen
siempre en `src/app/`.

**Reglas y trampas.** Los skeletons se usan para el primer prototipo; después el
usuario indica cuándo actualizarlos (no reescribirlos por iniciativa propia).
`error.tsx` es la UI de error centralizada.

**Huecos menores (no impiden resolver los casos):**

- `docs/components/README.md:73-79` lista 5 skeletons. En disco hay 6: falta
  `SkeletonPulse` (`skeletons/SkeletonPulse.tsx`, exportado en `skeletonindex.tsx:5`).
- `HomePageSkeleton.tsx:8-10` define un `SkeletonPulse` **local** que duplica el
  de `SkeletonPulse.tsx` (con `rounded-xl` vs `rounded-md`). Duplicación que la
  doc no menciona.
- `HomePageSkeleton.tsx:1-6` importa desde `"./skeletonindex"` (el barrel que lo
  reexporta): import circular. Funciona pero es frágil.
- `error.tsx:19` expone `error.message` crudo al usuario, lo que `.hermes.md:371-372`
  prohíbe explícitamente ("Nunca expongas `error.message` crudo: puede filtrar
  SQL, paths"). Es una contradicción entre la regla y el código. La doc no lo
  marca como bug a corregir.

**Archivos que toca.** `src/components/skeletons/<Nombre>Skeleton.tsx`,
`src/components/skeletons/skeletonindex.tsx`, `src/app/loading.tsx`,
`src/app/error.tsx`.

---

### 7. i18n — INCOMPLETO

**Que hace y por que existe.** El idioma viaja en el query param `?lang=`. El
orquestador lo lee (`page.tsx:24-27`), lo pasa a `getSiteData(lang)` y el
servicio elige el JSON o la RPC con ese `lang_code`.

**Como se usa en el dia a dia.** El flujo está implícito pero funciona:
`LanguageToggle.tsx` (o `LanguageSwitcher.tsx`) lee `searchParams.get("lang")`,
hace `router.push("?lang=en")` y el server vuelve a renderizar.

**Reglas y trampas.** El idioma por defecto es `"es"`
(`site.ts:182` `DEFAULT_LANG`). Un lang desconocido cae al default
(`site.ts:185`: `STATIC_PAYLOADS[lang] ?? STATIC_PAYLOADS[DEFAULT_LANG]`).

**Por qué es INCOMPLETO — lo que no está en ningún lado:**

1. **No hay un módulo `docs/i18n/`.** La doc de i18n está repartida: un
   párrafo en `docs/data/README.md:98-104` ("Cambiar los idiomas") y nada más.
   `docs/README.md:9-19` no lista i18n entre los módulos.
2. **No se documenta el mecanismo completo.** Falta: dónde se lee el param
   (`page.tsx:25`), que es un Server Component y por eso el cambio de idioma
   dispara un re-fetch del server (no hay cliente que intercambie strings), que
   `LanguageToggle`/`LanguageSwitcher` son Client Components con
   `useSearchParams` (requieren el `<Suspense>` que Next 16 exige en páginas
   estáticas), y que el `lang` **no se propaga a los links internos**: el
   `NavBar` usa `#Projects` como ancla, así que un click borra el `?lang=`.
3. **No se documenta el tipo `Language`.** `types.ts:44` declara
   `Language = "en" | "es"` hardcodeado, mientras `types.helper.ts:12` declara
   `Language` como la fila de la tabla `languages`. Dos tipos con el mismo
   nombre y semántica distinta. La doc no advierte del choque.
4. **No se documenta `LanguageSwitcher` vs `LanguageToggle`.** Hay dos atoms
   distintos para cambiar de idioma (uno alterna es/en, el otro muestra dos
   botones). `NavBar` usa el `Toggle`; el `Switcher` está en el barrel y no se
   usa en ninguna parte. Elegir cuál usar es decisión del proyecto y no está
   documentada.
5. **La lista de idiomas no está centralizada.** Los idiomas viven en tres
   lugares sin relación: `STATIC_PAYLOADS` (`site.ts:177`), el tipo `Language`
   (`types.ts:44`), y la tabla `languages` de Supabase (`setup-database.sql:26-40`).
   Agregar un idioma exige los tres y la doc no lo dice.

**Archivos que toca.** `src/app/page.tsx`, `src/services/data/site.ts`
(`STATIC_PAYLOADS`, `DEFAULT_LANG`), `src/services/data/static/site.<lang>.json`,
`src/components/atoms/LanguageToggle.tsx`, `src/components/atoms/LanguageSwitcher.tsx`,
`src/components/types.ts`, `setup-database.sql`.

---

### 8. Route groups — INCOMPLETO

**Que hace y por que existe.** Separar el sitio público del panel de
administración, con control de acceso por rol.

**Como se usa en el dia a dia.** La estructura real en disco:

```
src/app/
├── page.tsx                  ← landing (público)
├── layout.tsx                ← raíz
├── loading.tsx, error.tsx
├── login/page.tsx            ← login (email + Google OAuth)
├── auth/
│   ├── callback/route.ts     ← Route Handler: exchangeCodeForSession
│   └── route/page.tsx        ← post-login: admin → /admin, si no → /
└── (admin)/
    ├── layout.tsx            ← guard: sesión + profiles.role === "admin"
    └── admin/page.tsx        ← placeholder del panel
```

El guard de `(admin)/layout.tsx` es sólido: sin Supabase configurado redirige
a `/`, sin sesión a `/login`, y si `profiles.role !== "admin"` a `/`.

**Reglas y trampas.** `middleware.ts` (raíz) refresca la sesión de Supabase en
cada request; sin eso el token expira mientras el usuario naveva.

**Por qué es INCOMPLETO:**

1. **No hay un módulo `docs/route-groups/` ni `docs/admin/`.** Ninguna de las 7
   carpetas de `docs/` cubre el route group `(admin)`, el flujo de auth ni el
   middleware. `docs/README.md` no los lista.
2. **El flujo de auth end-to-end no está escrito.** El README raíz lo nombra
   como feature ("Login, OAuth (Google), callback, route group `(admin)`
   protegido por rol") pero no explica la secuencia. Una IA nueva que quiera
   tocar el login tiene que leer 4 archivos (`login/page.tsx`,
   `auth/callback/route.ts`, `auth/route/page.tsx`, `(admin)/layout.tsx`) sin
   mapa.
3. **El README raíz desactualiza la estructura.** `README.md:245-257` describe
   `src/app/auth/callback/route.ts` y `src/app/auth/route/page.tsx`; el código
   tiene además `src/app/login/page.tsx` y `(admin)/admin/page.tsx`, que sí
   aparecen, pero el README omite que `(public)` **ya no existe** (el
   `git status` muestra que `(public)/` fue eliminado en la migración). La
   decisión de por qué se eliminó el route group `(public)` no está registrada
   en `docs/decisions/`.
4. **`docs/decisions/` está vacío.** El índice declara dos decisiones
   registradas (`docs/decisions/README.md:36-38`): `package-manager-bun.md` y
   `data-source-switch.md`. **Ninguno de los dos archivos existe.** Es la
   referencia más importante del template (el stack y el modo de datos) y no
   está escrita.

**Archivos que toca.** `src/app/(admin)/layout.tsx`, `src/app/(admin)/admin/page.tsx`,
`src/app/login/page.tsx`, `src/app/auth/callback/route.ts`,
`src/app/auth/route/page.tsx`, `middleware.ts`, `src/services/supabase/middleware.ts`.

---

### 9. Documentación del proyecto — PARCIAL

**Que hace y por que existe.** La doc vive en `docs/`, dentro de la carpeta de
código. Una carpeta por módulo, cada una con un `README.md` índice.

**Como se usa en el dia a dia.**

```bash
cat docs/graphify/graphify-out/GRAPH_REPORT.md   # overview del proyecto
jq '.edges[] | select(.target | contains("site.ts")) | .source' \
  docs/graphify/graphify-out/graph.json
```

**Como se mantiene.** Se crea una carpeta `docs/<modulo>/` con su `README.md` y
se la suma al índice de `docs/README.md` (`docs/README.md:27-31`).

**Reglas y trampas.** Nombres en `kebab-case`, sin numeraciones ni fechas. La
doc describe el estado actual del código, no la historia. El output de Graphify
no se commitea (ya está en `.gitignore`).

**Huecos concretos:**

1. **`docs/decisions/` no tiene los documentos que declara** (ver sistema 8).
2. **`docs/graphify/README.md` tiene el comando de `jq` desactualizado.**
   `docs/graphify/README.md:36` usa `.edges[]`. En el `graph.json` que genera
   Graphify las aristas viven en la clave `links`, no en `edges`: contar
   `g["edges"]` devuelve 0 y hace parecer que el grafo está vacío. El comando
   de la doc devuelve vacío.
3. **Falta el paso de `cluster-only`.** `docs/graphify/README.md:9-19` dice que
   `graphify extract src/ --out docs/graphify/` genera `graph.json`,
   `GRAPH_REPORT.md` y `graph.html`. En la práctica `extract` produce el grafo
   crudo y **`cluster-only` es el que genera `GRAPH_REPORT.md` y `graph.html`**.
   Sin ese paso, el agente que siga la doc va a buscar un `GRAPH_REPORT.md` que
   no existe.
4. **El backend de Graphify está mal especificado para este entorno.**
   `docs/graphify/README.md:15-16` instala `graphifyy[openai]` y no menciona
   `OPENAI_BASE_URL` / `OPENAI_MODEL` / `GRAPHIFY_OPENAI_MODEL` /
   `OPENAI_API_KEY`. Con el proveedor MiniMax hay que exportarlos y pasar
   `--backend openai --model MiniMax-M3.1-Flash`, y el modelo requiere thinking
   adaptativo activo. Sin eso, la extracción falla.
5. **La carpeta `docs/` del template está sin trackear en git**
   (`git ls-files docs` no devuelve nada). Todo el trabajo de documentación
   está en untracked. No es un problema de la doc, pero es un problema del
   estado del repo.
6. **Falta el CHANGELOG.** `.hermes.md:400` pide "Cambios significativos van al
   `CHANGELOG.md` del proyecto" y el README lista `CHANGELOG.md` en la capa
   agente, pero el template no tiene ninguno ni tiene reglas de versionado.

**Archivos que toca.** `docs/README.md`, `docs/<modulo>/README.md`,
`docs/decisions/<decision>.md`, `.gitignore`, `biome.json` (excluye
`docs/graphify`).

---

### 10. Tooling — PARCIAL

**Que hace y por que existe.** Un solo stack, sin alternativas: Bun para
dependencias, Biome para lint y format, TypeScript estricto, Tailwind v4.

**Como se usa en el dia a dia.**

```bash
~/.bun/bin/bun install
~/.bun/bin/bun run dev
~/.bun/bin/bun run lint      # biome check
~/.bun/bin/bun run format    # biome format --write
~/.bun/bin/bunx tsc --noEmit
```

**Reglas y trampas.** `package.json` declara `packageManager: bun@1.4.4` y el
lockfile es `bun.lock`: no generar `package-lock.json` ni `pnpm-lock.yaml`.
`biome.json` tiene los dominios `next` y `react` activados e ignora
`docs/graphify`. `tsconfig.json` tiene `strict: true` y el alias `@/*` →
`./src/*`. `next.config.ts` activa `reactCompiler: true`.

**Huecos concretos:**

1. **El tooling no tiene carpeta propia en `docs/`.** `docs/README.md` no
   lista `tooling`. La información vive en `.hermes.md:89-122` y en el README
   raíz (Comandos). Para una IA que solo lee `docs/`, no existe.
2. **El gate de calidad no está escrito como criterio de salida ejecutable.**
   `.hermes.md:434-436` dice que tienen que pasar `tsc --noEmit`, `bun run lint`,
   `bun run build` y el dev server. Verificado en este template: los tres
   primeros pasan limpios (`biome check src/` → 0 errores; `tsc --noEmit` →
   exit 0; `bun run build` → compila y genera 8 rutas). Falta el comando
   documentado para levantar el dev server y verificar que responde.
3. **No hay `bun test` ni infraestructura de tests.** El repo tiene 0 archivos
   de test y el `package.json` no tiene script `test`, pese a que
   `.hermes.md:417` menciona "TDD cuando aplique". Una IA nueva no tiene
   cómo saber si "aplica".
4. **Falta la sección de versionado.** No hay tags de git, no hay CHANGELOG, no
   hay política de semver. Ver matriz de mantenimiento.

**Archivos que toca.** `package.json`, `bun.lock`, `biome.json`, `tsconfig.json`,
`next.config.ts`, `postcss.config.mjs`, `middleware.ts`.

---

## Los 6 casos resueltos

### Caso 1 — "Quiero agregar una paleta nueva `ocean`"

**Respuesta esperada.**

1. `src/app/globals.css`: nuevo bloque `.ocean { ... }` con las **45** variables
   (copiar `.rosepine-dark` y cambiar los valores).
2. `src/app/globals.css`: no hace falta tocar `@theme` si la paleta reutiliza
   tokens existentes. Si la paleta introduce un token nuevo, agregarlo en
   `@theme` y en las 4 paletas.
3. `src/components/hooks/theming.v2.ts:24`: agregar `"ocean"` al tipo `Theme`.
4. `src/components/hooks/useTheme.tsx:6`: agregar `"ocean"` al tipo `Theme`.
5. `src/components/hooks/useTheme.tsx:9-14`: agregar `"Ocean"` a `ThemeData`
   (el `ThemeSwitcher` mapea con `cat.toLowerCase()`, así que el label tiene que
   pasar a `"ocean"` exactamente).
6. `src/components/hooks/themeProvider.tsx:16`: agregar `"ocean"` al array
   `themes`.
7. `src/app/layout.tsx:51`: agregar `"ocean"` al array `themes`.
8. `src/app/layout.tsx:30`: agregar `"ocean"` al array `v` de la
   `ANTI_FOUC_SCRIPT`. **Sin esto, la paleta nueva no se aplica en el primer
   paint** y el sitio arranca en `dark`.

**¿La doc alcanza?** No del todo. `docs/theming/README.md` dice "agregar una
variable nueva" (4 pasos) pero **no dice cómo agregar una paleta**, que son 8
pasos en 5 archivos. La IA tiene que derivar los pasos 3-8 leyendo el código.
Además la doc dice "36 variables" cuando son 45. `.hermes.md` cubre el punto 1
y 2 pero tampoco la receta de paleta.

**Veredicto: hueco confirmado.** La receta de paleta nueva debería estar
completa en `docs/theming/README.md`.

---

### Caso 2 — "Quiero agregar una seccion nueva `BlogSection` al final de la landing"

**Respuesta esperada.**

1. `src/components/schemas.ts`: `BlogContentSchema` (Zod) + `BlogMetadataSchema`
   si lleva metadata + los `z.infer` correspondientes.
2. `src/services/data/site.ts:51`: registrar `"section.blog"` en
   `CONTENT_SCHEMAS`; en `METADATA_SCHEMAS` si aplica.
3. `src/services/data/site.ts:70`: agregar `"section.blog"` al tipo
   `SiteContent` (y `SiteMetadata`).
4. `src/services/data/static/site.es.json` y `site.en.json`: bloque
   `section.blog` en `content` (y `metadata`).
5. `src/components/types.ts`: contrato de props (`BlogSectionProps`).
6. `src/components/organisms/BlogSection.tsx`: el componente.
7. `src/components/components.ts`: exportarlo del barrel.
8. `src/components/skeletons/BlogSectionSkeleton.tsx` + exportarlo en
   `skeletonindex.tsx` + agregarlo a `HomePageSkeleton.tsx`.
9. `src/app/page.tsx`: pedir `content["section.blog"]`, armar el prop y
   renderizarlo dentro de `<main>` (después de `ContactSection`).
10. En Supabase: filas en `content_blocks`, `translations` y
    `content_blocks_metadata`.
11. Documentar: `docs/components/README.md` y/o un `docs/<módulo>/`.

**¿La doc alcanza?** Casi. `docs/components/README.md:85-91` cubre los pasos
6-7-8 (nivel, types, barrel, skeleton). `docs/data/README.md:89-96` cubre el
paso 4 y 10 para _proyectos_, no para secciones nuevas. **Falta la receta
específica de "sección nueva"**: los pasos 2 y 3 (registrar el schema en
`CONTENT_SCHEMAS`/`METADATA_SCHEMAS` y ampliar el tipo `SiteContent`) no están
en ningún lado, y son los que hacen que el bloque se valide y se tipifique. Sin
ellos, la IA los descubre por el error de TypeScript.

**Veredicto: hueco confirmado, pero recuperable.** La IA llegaría al resultado
correcto en 2-3 iteraciones, mirando `site.ts`.

---

### Caso 3 — "Quiero cambiar el color del boton primario"

**Respuesta esperada.** `src/app/globals.css`, bloque de cada paleta:
cambiar `--primary` (y `--primary-foreground` si el contraste lo pide).

```css
.dark {
  --primary: #976aff;
} /* globals.css:107 */
.light {
  --primary: #7c3aed;
} /* globals.css:178 */
```

No hay que tocar `@theme` (ya expone `--color-primary: var(--primary)`,
`globals.css:28`) ni ningún componente: los botones usan `bg-primary` /
`text-primary-foreground`.

**¿La doc alcanza?** Sí, para el color en sí. `docs/theming/README.md:56-61`
dice que una variable se define en las 4 paletas y se expone en `@theme`; el
README raíz (línea 284) mapea "los colores o la paleta" → `globals.css`.

**Trampa que la doc no marca:** el valor de `--primary` tiene que cambiar en
**las 4 paletas** si querés el color consistente en todas, y en las 4
`--primary-foreground` si el contraste cambia. Y `text-primary-foreground` **no
es siempre `#fff`**: en `.rosepine-dark` es `#191724` porque el primary de
Rosepine es claro. `.hermes.md:171-174` lo explica; `docs/theming/README.md:86`
solo dice "usar `text-primary-foreground` en vez de `text-white`".

**Veredicto: DOCUMENTADO con una trampa menor.**

---

### Caso 4 — "Quiero cambiar el proyecto para que use Supabase en vez de data estatica"

**Respuesta esperada.**

1. Crear el proyecto en Supabase.
2. Correr `setup-database.sql` en el SQL Editor (crea `languages`,
   `content_blocks`, `content_blocks_metadata`, `translations`, `profiles`, las
   policies, el trigger `handle_new_user` y el RPC `get_site_payload`).
3. `.env.local`: `DATA_SOURCE=supabase`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Reiniciar el dev server.
5. Cargar el contenido real en `content_blocks` + `translations` +
   `content_blocks_metadata`.
6. Opcional: regenerar los tipos con `supabase gen types`.

**¿La doc alcanza?** Casi todo, pero con un hueco grande. El README raíz
(líneas 102-109) tiene los pasos 1-4 y menciona `setup-database.sql`.
`docs/data/README.md:95-96` cubre el paso 5.

**Lo que NO está en ningún lado:**

- **`setup-database.sql` no está en ninguna de las 7 carpetas de `docs/`.**
  Los grep de `setup-database` sobre `docs/` dan 0 resultados. Solo aparece en
  el README raíz y en la tabla de `.hermes.md`. Para una IA que solo lee
  `docs/`, el paso 2 es invisible: corre el RPC y no existe.
- **La lista de tablas y de qué va en cada una.** El RPC devuelve
  `{content, metadata}` indexados por `key` de bloque, pero el mapeo
  "qué filas van en `translations` vs en `content_blocks_metadata`" solo se
  deduce leyendo el SQL.
- **Qué pasa con los JSON estáticos.** `docs/data/README.md` no dice si hay que
  borrar `src/services/data/static/` al pasar a Supabase. La respuesta
  correcta es que **no hay que borrarlos**: son el fallback cuando no hay
  credenciales (`env.ts:63-68`). Un proyecto que los borre pierde la capacidad
  de arrancar sin BD.
- **El orden de migración del contenido.** No está escrito que hay que
  insertar primero el `content_blocks` (por el FK de `translations` y
  `content_blocks_metadata`) y después las traducciones.

**Veredicto: hueco confirmado.** El paso 2 es bloqueante para una IA que solo
lee `docs/`.

---

### Caso 5 — "Quiero agregar un campo `subtitle` al bloque hero"

**Respuesta esperada.**

1. `src/components/schemas.ts:45-51`: agregar `subtitle: z.string()` a
   `HeroContentSchema`. El tipo `HeroContent` (`z.infer`) se actualiza solo.
2. `src/components/types.ts`: no hace falta tocarlo para el campo de contenido.
   Solo si el organism expone el campo en un contrato de props propio (en este
   caso no: `HeroSection` recibe `hero_data: HeroSection` y `HeroContent` ya
   cambió).
3. `src/components/organisms/HeroSection.tsx`: renderizar
   `hero_data.data.subtitle`.
4. `src/services/data/static/site.es.json` y `site.en.json`: agregar
   `subtitle` al bloque `section.hero` **de los dos idiomas**. Si falta en uno,
   `getSiteData` lanza (`site.ts:113-124`): la validación es por idioma.
5. En Supabase: agregar el campo al JSONB de `translations.content` para
   `section.hero` en cada `lang_code`.
6. Si el campo va en metadata (no traducible), el paso 4 es sobre
   `content_blocks_metadata.content` y el schema es `HeroMetadataSchema`
   (`schemas.ts:152-156`).

**¿La doc alcanza?** Sí, con un matiz. `docs/data/README.md:70-77` explica que
todo pasa por Zod y falla ruidoso; `docs/data/README.md:98-104` explica los
idiomas. El lector entiende que un campo nuevo toca schema + JSON + (BD).

**Trampa que la doc no marca:** el schema Zod tiene que matchear el shape real
de la BD, y en metadata eso significa **snake_case**
(`is_relevant`, `link_github`). Si el campo se llama `isRelevant` en el schema
y `is_relevant` en la BD, `safeParse` falla en runtime y TypeScript no se
entera. Esto está en `project-code-standards` y en el SOUL, pero **no** en la
doc del template (`docs/data/README.md` no lo dice). Una IA que solo lea
`docs/` puede meter ese bug.

**Veredicto: PARCIAL.** Resoluble, con un riesgo real de shape mismatch que la
doc del template no cubre.

---

### Caso 6 — "Quiero una animacion de entrada en una seccion nueva"

**Respuesta esperada.**

```tsx
// En el organism nuevo, o envolviendo en page.tsx
import { SectionReveal } from "@/components/animations/Animations";

<SectionReveal>
  <BlogSection blog_data={blog_data} />
</SectionReveal>;
```

Si la sección tiene items en lista:

```tsx
<StaggerGroup>
  {posts.map((post) => (
    <StaggerItem key={post.id}>
      <PostCard post={post} />
    </StaggerItem>
  ))}
</StaggerGroup>;
```

**¿La doc alcanza?** Sí. `docs/motion/README.md` da el patrón `whileInView` con
`viewport={{ once: true, margin: "-10% 0px" }}`, el patrón de stagger, y la
regla de que `StaggerItem` no define `initial` ni `whileInView`. `.hermes.md:207-228`
repite lo mismo. Las primitivas están todas verificadas en el código.

**Trampas que la doc sí cubre:** `m` y no `motion` (por `strict`), `once: true`
obligatorio, sin `IntersectionObserver` manual, sin loops infinitos, `AnimatePresence`
para salidas.

**Trampa que la doc NO cubre:** `Animations.tsx` tiene `"use client"` en la
línea 1. Importar una primitiva de ahí **convierte al consumidor en cliente**.
En `page.tsx` no molesta (ya es un Server Component que renderiza un Client
Component children), pero si el organism nuevo usa `SectionReveal` internamente
y el organism es un Server Component, el organism se vuelve Client Component
— y con él, todos sus hijos. La regla correcta ("`use client` lo más bajo
posible") está en la doc, pero el caso concreto "usá SectionReveal desde
`page.tsx`, no desde dentro del organism" no.

**Veredicto: DOCUMENTADO con una trampa no explicitada.**

---

## Matriz de mantenimiento a futuro

### Como se actualiza el template sin romper los proyectos que lo usan

Hoy no hay ninguna infraestructura: `git tag` está vacío, no hay CHANGELOG, no
hay versioning. El estado real es que `docs/` completo, `README.md`,
`.hermes.md`, `biome.json` y `bun.lock` están **untracked** sobre un historial
que todavía habla de pnpm y ESLint (los commits `6f8f553` y `73965c3` son de
la etapa pnpm).

Lo que hace falta, en orden de importance:

1. **Cerrar el commit actual.** Con `docs/`, `README.md`, `.hermes.md`,
   `biome.json` y `bun.lock` sin trackear, el template no es reproducible desde
   el repo remoto. Nada de lo que hay abajo se puede discutir sobre un
   historial que no existe.
2. **Un CHANGELOG.md con semver.** `MAJOR` = se rompe un contrato (shape del
   payload, nombres de token, estructura de carpetas). `MINOR` = se agrega algo
   backwards-compatible (una primitiva, un módulo de docs). `PATCH` = fix.
3. **Tags de git** (`v1.0.0`) y una sección en el README con la tabla de
   versiones y qué se rompió en cada una.
4. **Un "protocolo de actualización" para los proyectos derivados.** La
   opción más simple y la que menos se rompe: **el template no se actualiza
   automáticamente**. Un proyecto que lo clonó es un repo independiente, y las
   actualizaciones se portan a mano con cherry-pick del commit correspondiente.
   La alternativa (subtree / submodule) suma complejidad que el usuario no
   pidió. La regla que hay que escribir: _"el template congela la infra; las
   actualizaciones se portan por commit, no por merge de ramas"_.
5. **Regla de no tocar el código del proyecto consumidor.** Un cambio en el
   template que rompa el contrato de datos no se puede propagar solo: hay que
   publicarlo como major con la nota de migración.

### Que es versioning-compatible y que no

| Cambio                                                             | Compatible  | Por que                                                                             |
| ------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------- |
| Agregar una primitiva de Motion                                    | Si          | Se agrega al barrel, no cambia ninguna firma                                        |
| Agregar un componente en `atoms/`/`molecules/`/`organisms/`        | Si          | Solo si se exporta del barrel y no cambia props existentes                          |
| Agregar un token de color                                          | Si          | Es additive: 4 paletas + `@theme` + `ThemeToken`                                    |
| Agregar un modulo de `docs/`                                       | Si          | Additive                                                                            |
| Agregar un skeleton                                                | Si          | Additive                                                                            |
| Agregar un campo **opcional** a un schema Zod                      | Con cuidado | Zod no falla, pero el DB y los JSON quedan desalineados si no se actualizan todos   |
| Agregar un campo **requerido** a un schema Zod                     | No          | Falla la validación en runtime hasta que se actualicen TODOS los JSON y filas de BD |
| Cambiar el shape del payload (`content`/`metadata`)                | No          | Rompe todos los proyectos derivados                                                 |
| Cambiar la clave de un bloque (`section.hero` → `section.hero_v2`) | No          | Rompe el mapeo de la BD y los JSON                                                  |
| Cambiar los nombres de las variables CSS                           | No          | Rompe todos los componentes que las usen                                            |
| Cambiar `resolveDataSource()` o el nombre de `DATA_SOURCE`         | No          | Rompe el `.env` de cada proyecto                                                    |
| Cambiar el contrato de `getSiteData` / `pickProjects`              | No          | Rompe el orquestador                                                                |
| Mover `src/components/` a otra carpeta                             | No          | Rompe todos los imports                                                             |
| Cambiar `motion` por `framer-motion`                               | No          | Cambia el bundle y todas las primitivas                                             |
| Cambiar el nombre de `DATA_SOURCE` o de `NEXT_PUBLIC_*`            | No          | Rompe el `.env`                                                                     |
| Cambiar el backend de Graphify o su carpeta de output              | No          | Rompe el flujo de documentación                                                     |

### Como se agrega un componente reutilizable al template

1. Definir el nivel (atom / molecule / organism) y por qué.
2. Props en `src/components/types.ts`, tipadas, sin `any`.
3. Si el componente recibe datos del dominio: schema Zod en
   `src/components/schemas.ts` (con `z.infer`), nunca tipos a mano.
4. Implementar en `src/components/<nivel>/<Nombre>.tsx`. Un componente por
   archivo, named exports, `"use client"` solo si lo necesita.
5. Exportarlo de `src/components/components.ts`.
6. Si es sección: agregar su skeleton + indexarlo en `skeletonindex.tsx`.
7. Si es una animación: la variante va a nivel de modulo en `Animations.tsx`.
8. Documentarlo en `docs/components/README.md` (o el módulo que corresponda).
9. Verificar: `tsc --noEmit`, `bun run lint`, `bun run build`.

Criterio de "reutilizable" (lo que lo hace subir de nivel): un componente entra
al template si no tiene dependencias del dominio de un proyecto concreto, si su
API es genérica y si no arrastra un esquema de datos propio.

### Como se deprecia un componente del template

No hay protocolo. El que corresponde, y que hay que escribir:

1. **No borrar de golpe.** Marcar primero.
2. Marcar en el componente: `@deprecated` en el JSDoc + un comentario con la
   fecha y el reemplazo.
3. **No quitarlo del barrel.** Si se saca del barrel, el import deja de
   resolver y el error aparece en el proyecto consumidor, no en el template. Se
   deja exportado pero sin usar en el template.
4. Anotarlo en el `CHANGELOG.md` como deprecated con la alternativa.
5. Recién en la major siguiente: sacarlo del barrel y borrarlo.
6. Nunca tocar `types.ts` ni `schemas.ts` de un consumidor: la deprecación se
   propaga por el changelog, el consumidor decide cuándo.

### Que reglas son del PROYECTO y cuales son del TEMPLATE

| Regla                                                   | Dónde vive                                    | Por qué                                                                             |
| ------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Stack (Bun, Biome, Tailwind v4, Motion, Zod)            | **Template**                                  | Es la razón de ser del template. Cambiarla es un major del template                 |
| Atomic design de 3 niveles                              | **Template**                                  | Es la arquitectura de referencia                                                    |
| Theming v2 con 4 paletas y 45 vars                      | **Template** (la infra)                       | El mecanismo es del template; los valores concretos de cada paleta son del proyecto |
| Los colores concretos de cada paleta                    | **Proyecto**                                  | Cada proyecto puede querer otros                                                    |
| Motion: `LazyMotion` + `m` + `whileInView`              | **Template**                                  | Regla de performance y de build                                                     |
| Data dual: los dos modos con la misma forma             | **Template**                                  | Es el contrato                                                                      |
| Cuál modo usar (static o supabase)                      | **Proyecto**                                  | Decisión del proyecto (pregunta 1)                                                  |
| Qué secciones tiene la landing                          | **Proyecto**                                  | Es el dominio                                                                       |
| Qué idiomas                                             | **Proyecto**                                  | Decisión del proyecto (pregunta 2)                                                  |
| Qué paletas                                             | **Proyecto**                                  | Decisión del proyecto (pregunta 3)                                                  |
| Si hay auth / panel admin                               | **Proyecto**                                  | Decisión del proyecto (pregunta 4)                                                  |
| Qué módulos se documentan                               | **Proyecto**                                  | Decisión del proyecto (pregunta 5)                                                  |
| Nombres de archivo, kebab-case, sin fechas              | **Template**                                  | Convención transversal                                                              |
| `error.tsx` y `loading.tsx` siempre                     | **Template**                                  | Red de seguridad                                                                    |
| "Nunca commits sin OK", "no tocar código sin consultar" | **Perfil del agente (SOUL)**, no del template | Es una regla del harness, no del código                                             |
| `docs/` con una carpeta por módulo                      | **Template**                                  | Estructura                                                                          |

La regla práctica: **el template congela el _cómo_; el proyecto decide el
_qué_.** Si una regla no se puede aplicar igual a dos proyectos distintos, es
del proyecto.

---

## Que le falta al template

Ordenado por impacto sobre una IA que usa el template sola.

### Resueltos en esta iteracion (2026-11-09)

Estos cinco huecos estaban abiertos cuando se escribio esta auditoria. Ya no
estan: los documentos existen y se pueden leer.

| #   | Hueco original                                                                                                                           | Resuelto en                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **`docs/` no menciona `setup-database.sql`.** El paso que crea las tablas, el RPC y las policies no estaba en ninguna carpeta de `docs/` | **`docs/setup-database.md`** (nuevo): que hace el script, como correrlo, que se necesita antes, como verificar y como cargar el contenido |
| 2   | **No existia la receta "agregar una paleta nueva".** Eran 8 pasos en 5 archivos y la doc solo cubria "agregar una variable"              | **`docs/theming/paleta-nueva.md`** (nuevo): los 8 pasos, con el path y el nombre exacto de la variable en cada uno                        |
| 3   | **`docs/decisions/` estaba vacio.** El indice declaraba dos documentos que no existian                                                   | **`docs/decisions/package-manager-bun.md`** y **`docs/decisions/data-source-switch.md`** (nuevos)                                         |
| 4   | **No habia un modulo `docs/i18n/`.** El mecanismo completo no estaba escrito                                                             | **`docs/i18n/README.md`** (nuevo): el query param, el default, los datos por idioma, las anclas y el tipo `Language` duplicado            |
| 5   | **No habia un modulo de route groups / auth / admin.** El flujo login → callback → route → guard de rol no estaba mapeado                | **`docs/auth-and-routes/README.md`** (nuevo): el mapa de rutas, los cuatro archivos del flujo y el guard de rol                           |

Ademas se resolvieron, en la misma iteracion, cuatro bugs de codigo que la
auditoria habia detectado como documentacion desactualizada:

| Que se corrigio                                                                                       | Donde                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| El image loader estaba documentado como activo pero `next.config.ts` no lo habilitaba (codigo muerto) | `next.config.ts` ahora declara `images.loader: "custom"` con el `loaderFile`                                                          |
| `error.tsx` exponia `error.message` crudo al usuario, prohibido por `.hermes.md`                      | `src/app/error.tsx` ahora registra el error en la consola y muestra un mensaje generico                                               |
| El tema por defecto estaba en tres lugares y no coincidian (`dark` vs `rosepine-dark`)                | `src/app/layout.tsx` y `themeProvider.tsx` unificados en `rosepine-dark`, con la `ANTI_FOUC_SCRIPT` alineada                          |
| La doc de theming decia "36 variables" cuando hay 45                                                  | `docs/theming/README.md` y `src/components/hooks/theming.v2.ts` corregidos a 45 (verificado contando los `--token:` de los 4 bloques) |

### Pendientes

Ordenados por impacto. **No se tocaron en esta iteracion**: son cambios de
codigo o de doc que requieren una decision del proyecto.

| #   | Falta                                                                                                                                                                                        | Impacto                                                                                                                     | Sistema       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 6   | **La regla de imports del barrel contradice el codigo.** La doc dice "imports directos internos"; el codigo usa el barrel en 20 de 29 casos                                                  | **Alto**: la IA va a reescribir imports que funcionan y a introducir el bug de Turbopack (barrel mezclando client y server) | Atomic design |
| 7   | **No hay receta de "seccion nueva"**: registrar el schema en `CONTENT_SCHEMAS`/`METADATA_SCHEMAS` y ampliar `SiteContent`/`SiteMetadata`                                                     | **Medio-alto**: son los pasos que hacen que el bloque se valide y se tipifique                                              | Data dual     |
| 8   | **El `jq` de Graphify usa `.edges[]`; las aristas estan en `links`.** Y falta el paso `cluster-only` que genera `GRAPH_REPORT.md` y `graph.html`                                             | **Medio**: el comando de la doc devuelve vacio y el reporte no aparece                                                      | Documentacion |
| 9   | **El backend de Graphify no esta especificado** (`OPENAI_BASE_URL`, `OPENAI_MODEL`, `GRAPHIFY_OPENAI_MODEL`, `OPENAI_API_KEY`, thinking adaptativo)                                          | **Medio**: la extraccion falla con el proveedor configurado                                                                 | Documentacion |
| 10  | **La regla de `:where()` esta planteada como excepcion en `docs/theming/` y como REGLA DURA en el SOUL.** Con next-themes 0.4.6 verificado, la clase siempre va a `document.documentElement` | **Medio**: la IA no sabe cual aplicar y puede "arreglar" el CSS sin necesidad                                               | Theming       |
| 11  | **El snake_case de la BD contra el camelCase del schema no esta en la doc del template** (si, pero en `docs/setup-database.md`, no en `docs/data/`)                                          | **Medio**: bug de runtime silencioso (Zod falla, TS no se entera)                                                           | Data dual     |
| 12  | **Tooling sin carpeta propia en `docs/`**, sin gate de calidad ejecutable, sin tests, sin CHANGELOG ni tags                                                                                  | **Medio**: la doc del template no cubre como se verifica un cambio                                                          | Tooling       |
| 13  | **`IASection.tsx` y `OSSection.tsx` son organisms muertos** (no estan en el barrel, nadie los usa, son copias de `ProjectsSection`)                                                          | **Medio-bajo**: la IA los encuentra y no sabe que hacer con ellos                                                           | Atomic design |
| 14  | **`HomePageSkeleton` duplica `SkeletonPulse`** y se importa a si mismo por el barrel (circular)                                                                                              | **Bajo**: no rompe, pero es un mal ejemplo para una IA que copia                                                            | Skeletons     |
| 15  | **El tipo `Language` duplicado** (`types.ts:44` `"en" \| "es"` vs `types.helper.ts:12` fila de la tabla) y `LanguageSwitcher` sin usar                                                       | **Bajo**: ruido de tipos. Documentado en `docs/i18n/README.md`, pero el codigo no se toco                                   | i18n          |
| 16  | **El tipo `Theme` en `types.ts:43` sigue siendo `"dark" \| "light" \| "system"`**, incompatible con las 4 paletas reales                                                                     | **Bajo**: esta desactualizado pero nadie lo importa                                                                         | Theming       |
| 17  | **La tabla de skeletons no lista `SkeletonPulse`** (6 en disco, 5 en la doc)                                                                                                                 | **Bajo**                                                                                                                    | Skeletons     |
| 18  | **`docs/services/` no lista `types.helper.ts`**                                                                                                                                              | **Bajo**                                                                                                                    | Services      |
| 19  | **La metadata del ejemplo en `docs/data/README.md:21-27` no matchea `METADATA_SCHEMAS`** (no existe metadata para `section.projects` ni `section.footer`)                                    | **Bajo**: confunde al leer el contrato                                                                                      | Data dual     |
| 20  | **`docs/` completo esta sin trackear en git** (`git ls-files docs` no devuelve nada)                                                                                                         | **Bajo**: no es un problema de la doc, es del estado del repo                                                               | Documentacion |

### Los tres huecos mas criticos: como quedaron

1. **`setup-database.sql` no estaba en `docs/`.** Resuelto con
   `docs/setup-database.md`: la IA ahora sabe que correr, con que
   variables de entorno, como verificar el resultado y que hacer si la RPC no
   existe o faltan las policies.
2. **No habia receta de paleta nueva.** Resuelto con
   `docs/theming/paleta-nueva.md`: los 8 pasos con su path exacto. El paso
   que se perdia era el de la `ANTI_FOUC_SCRIPT`, y ahora esta escrito
   explicitamente con la consecuencia de saltarselo (flash de tema).
3. **`docs/decisions/` no tenia los dos documentos que su propio indice
   declaraba.** Resuelto: los dos ADRs existen, con contexto, decision,
   alternativas descartadas y consecuencias.

## Si sos una IA nueva usando este template

### Los 10 archivos que tenes que leer primero, en orden

| #   | Archivo                        | Por qué en este orden                                                                                                             |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `README.md` (raíz)             | Propósito, stack, las 5 preguntas iniciales, mapa de carpetas. 5 minutos y ya sabés qué es esto                                   |
| 2   | `.hermes.md`                   | Las reglas operativas: stack obligatorio, trampas, gate de calidad, comandos. Es el contrato de cómo trabajar acá                 |
| 3   | `src/app/globals.css`          | La fuente de verdad del color. Leé el bloque `@theme` y **una** paleta completa. Es donde se decide el 80% del CSS                |
| 4   | `src/app/page.tsx`             | El orquestador. Te muestra el orden de las secciones, de dónde salen los datos y cómo se pasan las props. 91 líneas, leelo entero |
| 5   | `src/services/data/site.ts`    | El contrato de datos: qué schemas existen, qué se valida, cómo se cachea, cómo se detectan los proyectos. El archivo que une todo |
| 6   | `src/components/schemas.ts`    | Los schemas Zod y los tipos del dominio. Acá ves la forma real de cada bloque de datos                                            |
| 7   | `src/components/components.ts` | El barrel. La API pública del sistema de diseño: qué existe y cómo se importa                                                     |
| 8   | `src/components/types.ts`      | Los contratos de props de cada componente. Sabés qué se le pasa a cada cosa                                                       |
| 9   | `src/app/layout.tsx`           | ThemeProvider, `ANTI_FOUC_SCRIPT`, `LazyMotion`, BackgroundFX, las clases de `<html>`/`<body>`. El esqueleto global               |
| 10  | `src/services/env.ts`          | El switch de modo de datos y el patrón de acceso a variables de entorno                                                           |

Al terminar esos 10, corré el gate antes de tocar nada:

```bash
~/.bun/bin/bunx tsc --noEmit   # exit 0 esperado
~/.bun/bin/bun run lint        # 0 errores esperado
~/.bun/bin/bun run build       # compila esperado
```

### Lo que NO leas al arrancar (ruido)

- **`src/components/organisms/IASection.tsx` y `OSSection.tsx`** — muertos, no
  están en el barrel, no los usa nadie. Son copias de `ProjectsSection`.
- **`src/services/assets/supabase-image-loader.ts`** — el loader no está
  habilitado en `next.config.ts`. Solo miralo si vas a servir imágenes de
  Storage.
- **`src/components/atoms/LanguageSwitcher.tsx`** — no lo usa nadie;
  `NavBar` usa `LanguageToggle`. Cuando toques i18n, elegí uno y borra el otro.
- **`src/components/skeletons/SkeletonPulse.tsx`** — está duplicado dentro de
  `HomePageSkeleton.tsx:8`. No lo copies.
- **`src/components/hooks/theming.v2.ts`** — es documentación ejecutable, no
  código de runtime (el propio archivo lo dice en la línea 7: "este archivo no
  se importa en ningún componente"). Leelo **después** de `globals.css`, como
  lista de tokens, no como fuente de verdad.
- **`bun.lock`** — 42 KB de dependencias resueltas. No se lee.
- **`node_modules/`** — solo `next-themes/dist/index.js` si necesitás verificar
  en qué nodo monta la clase (esa es la forma de resolver el `:where()`).
- **`.next/`, `tsconfig.tsbuildinfo`** — artefactos de build.
- **`setup-database.sql`** — leelo solo si vas a modo Supabase.

### El orden de trabajo cuando arrive una tarea

1. Si es una tarea de contenido o datos, empezá por `src/services/data/site.ts`
   y `src/components/schemas.ts`.
2. Si es una tarea visual, empezá por `src/app/globals.css`.
3. Si es una tarea de componente, empezá por `src/components/components.ts`
   para ver qué hay antes de escribir.
4. Antes de escribir código, verificá el estado real del archivo (no asumas).
5. Si tenés que elegir entre Supabase y data estática, o entre palettes, o
   entre idiomas, **preguntá**: son las 5 preguntas iniciales y las decisiones
   cambian qué hay que tocar.

---

## Estado de la documentacion

### Veredicto

**Los tres huecos criticos y los dos altos de documentacion estan resueltos.**
Una IA que entra al template con solo `docs/` (sin leer el codigo) puede
resolver los cinco casos de uso mas comunes sin adivinar:

| Caso de uso                                   | Se resuelve con                                  |
| --------------------------------------------- | ------------------------------------------------ |
| 1. Agregar una paleta nueva (`ocean`)         | `docs/theming/paleta-nueva.md`                   |
| 2. Agregar una seccion nueva (`BlogSection`)  | **Parcial**: ver abajo                           |
| 3. Cambiar el color del boton primario        | `docs/theming/README.md`                         |
| 4. Pasar el proyecto a Supabase               | `docs/setup-database.md`                         |
| 5. Agregar un campo `subtitle` al bloque hero | `docs/data/README.md` + `docs/setup-database.md` |
| 6. Animacion de entrada en una seccion nueva  | `docs/motion/README.md`                          |

Los tres casos que quedan incompletos son, en orden:

1. **Agregar una seccion nueva** (caso 2): faltan los pasos 2 y 3, que son
   registrar el schema en `CONTENT_SCHEMAS`/`METADATA_SCHEMAS` y ampliar el
   tipo `SiteContent`/`SiteMetadata`. Es recuperable: la IA llega al
   resultado correcto en 2-3 iteraciones mirando `site.ts`.
2. **La regla de imports del barrel** (pendiente 6): la doc de components
   contradice el codigo. Es el pendiente con mas riesgo de dano, porque la IA
   que sigue la doc reescribe imports que funcionan.
3. **El tooling sin carpeta propia en `docs/`** (pendiente 12): el gate de
   calidad esta en `.hermes.md`, no en `docs/`.

### Que se escribio en esta iteracion

| Documento                               | Tipo  | Estado |
| --------------------------------------- | ----- | ------ |
| `docs/setup-database.md`                | nuevo | Activo |
| `docs/theming/paleta-nueva.md`          | nuevo | Activo |
| `docs/decisions/package-manager-bun.md` | nuevo | Activo |
| `docs/decisions/data-source-switch.md`  | nuevo | Activo |
| `docs/i18n/README.md`                   | nuevo | Activo |
| `docs/auth-and-routes/README.md`        | nuevo | Activo |
| `docs/README.md`                        | nuevo | Activo |
| `docs/decisions/README.md`              | nuevo | Activo |
| `docs/template-guide.md`                | nuevo | Activo |

Modulo por modulo, como quedo el estado de los 10 sistemas:

| #   | Sistema                      | Estado      | Que cambio                                            |
| --- | ---------------------------- | ----------- | ----------------------------------------------------- |
| 1   | Theming v2                   | DOCUMENTADO | Receta de paleta nueva; conteo de vars corregido a 45 |
| 2   | Motion                       | DOCUMENTADO | Sin cambios                                           |
| 3   | Atomic design                | PARCIAL     | Sigue pendiente la regla de imports del barrel        |
| 4   | Data dual                    | DOCUMENTADO | `setup-database.md` + ADR del switch                  |
| 5   | Services                     | PARCIAL     | Image loader habilitado en `next.config.ts`           |
| 6   | Skeletons y estados de carga | DOCUMENTADO | `error.tsx` ya no expone `error.message` crudo        |
| 7   | i18n                         | DOCUMENTADO | Modulo `docs/i18n/` nuevo                             |
| 8   | Route groups                 | DOCUMENTADO | Modulo `docs/auth-and-routes/` nuevo                  |
| 9   | Documentacion del proyecto   | PARCIAL     | 8 documentos nuevos; falta `docs/` trackeado en git   |
| 10  | Tooling                      | PARCIAL     | ADR de Bun escrito; falta carpeta propia en `docs/`   |

### Hallazgos de la verificacion

Al escribir los documentos se verificaron en el navegador (dev server local)
comportamientos que la auditoria **habia supuesto** en un caso:

- **El `lang` NO se pierde al navegar por anclas.** La auditoria (item 4 de la
  tabla original) decia que el `?lang=` se borraba al clickear un link de ancla
  del nav. Medido: el parametro **sobrevive** (`?lang=en#Proyects`), porque
  un link de fragmento puro no recarga la pagina. Lo que **si** se pierde es
  el **hash** al cambiar de idioma (el `router.push` re-arma la URL y tira el
  fragmento, mandando al usuario al top). Esta distinction quedo escrita en
  `docs/i18n/README.md`.
- **Los placeholders del `.env.example` rompen el guard de rol.** Como
  `isSupabaseConfigured()` solo comprueba que las cadenas no esten vacias,
  copiar `.env.example` a `.env.local` sin editarlo hace que `/admin` y
  `/auth/route` tiren `Invalid supabaseUrl` en vez de redirigir. Documentado
  en `docs/auth-and-routes/README.md`.
- **`/auth/route` esta desconectado del flujo por defecto.** El callback
  redirige a `${origin}${next}` con `next = "/"`: la pagina de destino
  post-login existe y funciona, pero nunca se llega a ella salvo que se la
  pida con `?next=/auth/route`. Documentado en el modulo de auth.

Ninguno de los tres era un bug de codigo: son comportamientos reales que la
documentacion no describia, y ahora estan escritos con su comportamiento
real medido.

### Lo que sigue pendiente

En orden de impacto, sin cambios:

1. **La regla de imports del barrel** (`docs/components/README.md:39-40`):
   corregirla para que diga lo que hace el codigo.
2. **La receta de "seccion nueva"**: agregarla a `docs/data/README.md`.
3. **`docs/tooling/`**: carpeta propia con el gate de calidad ejecutable.
4. **Graphify**: el `jq` de `.edges[]` a `.links`, el paso `cluster-only` y las
   variables de entorno del backend.
5. **Los pendientes de codigo**: `IASection.tsx` y `OSSection.tsx` muertos, la
   duplicacion de `SkeletonPulse`, el tipo `Theme` de `types.ts:43`.
6. **El estado del repo**: `docs/` completo sigue sin trackear en git, y no
   hay CHANGELOG ni tags.

Ver la seccion "Matriz de mantenimiento a futuro" para el detalle de cada uno.
