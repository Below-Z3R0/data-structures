---

type: decision
status: active
created: 2026-11-09
tags: [bun, tooling, package-manager, biome, decision]
---

# Decision: Bun como package manager

## Contexto

El template arranca con un lockfile. La primera pregunta es que lo maneja:
`npm`, `pnpm` o `bun`.

El proyecto ya venia de una etapa con **pnpm** (los commits `6f8f553` y
`73965c3` del repo todavia lo reflejan: `pnpm-lock.yaml` y
`pnpm-workspace.yaml` fueron eliminados en la migracion). Ademas hay que
elegir el linter, que en esa etapa era **ESLint** (`eslint.config.mjs`,
tambien eliminado).

Hay dos costos reales de cambiar de stack de tooling:

1. **La friccion diaria.** Cada `bun install`, cada `bun run`, cada script de
   pegamento paga un costo de arranque.
2. **La dispersion del stack.** Si el template usa un package manager y los
   proyectos derivados usan otro, cada proyecto tiene que mantener sus
   propias convenciones y la documentacion del template deja de ser
   transferible.

### El costo de arranque, medido

Medicion del arranque de un proceso en este equipo (mediana de 8 corrida,
proceso recien lanzado desde disco, cache de pagina fria):

| Runtime   | Arranque | Binario  |
| --------- | -------- | -------- |
| `bash`    | ~2 ms    | 1.3 MB   |
| `python3` | ~20 ms   | 78.6 MB  |
| `bun`     | ~27 ms   | 107.3 MB |

La diferencia **no es del lenguaje**: es del tamano del binario. `bun` es un
runtime de 107 MB autocontenido, `python3` son 78 MB y `bash` son 1.3 MB. En
arranque en frio, el costo de arrancar es aproximadamente proporcional al
tamano del binario que hay que leer del disco.

Con la cache de pagina caliente, los tres bajan a menos de 5 ms y la
diferencia deja de importar:

| Runtime   | Arranque (cache caliente) |
| --------- | ------------------------- |
| `bash`    | ~1 ms                     |
| `bun`     | ~4 ms                     |
| `python3` | ~10 ms                    |

## Decision

**Bun es el package manager del template y de los proyectos que derivan de
el. Biome es el linter y el formatter. No hay ESLint, no hay Prettier.**

Concretamente:

- `package.json` declara `"packageManager": "bun@1.4.4"`.
- El lockfile es **`bun.lock`** (formato de texto de Bun).
- `bun install` en vez de `npm install` o `pnpm install`.
- `bun run <script>` en vez de `npm run` / `pnpm run`.
- `bunx <herramienta>` en vez de `npx` / `pnpx`.
- **Biome** hace lint **y** format (`biome check`, `biome format --write`).
  No hay ESLint, no hay Prettier, no hay `.eslintrc`, no hay
  `eslint.config.mjs`.
- TypeScript estricto con `tsc --noEmit` para el type check.

### Por que Bun y no npm ni pnpm

**Bun es el stack de los proyectos.** Los proyectos de este setup (Work,
Parallel, Know, Uny) ya corren con Bun. Si el template usara npm o pnpm,
cada proyecto derivado tendria que mantener dos convenciones de tooling: una
para el template y otra para su propio stack. La documentacion, los scripts y
las reglas del agente dejarian de ser transferibles.

**El lockfile es legible.** `bun.lock` es texto plano y se puede revisar en un
diff. `package-lock.json` es un archivo generado de cientos de lineas; los
lockfiles de pnpm son un directorio entero.

**`bun install` es mas rapido** en install y en resolucion de dependencias, que
es la operacion que se repite cuando se agrega un paquete.

**Bun corre TypeScript y JSX sin build.** `bun run un-script.ts` funciona
directo. Eso importa para los scripts de pegamento: un script de una sola
tarea no necesita `tsx` ni `ts-node` instalados.

**El runtime de Bun queda disponible para los scripts del proyecto.** Un
script de pegamento en TS se corre con `bun run`, sin instalar nada mas.

### Por que Biome y no ESLint + Prettier

- **Una sola herramienta** para lint y format, en vez de dos que se pisan.
- **Configuracion en un solo archivo** (`biome.json`), en vez de la
  combinacion de `eslint.config.mjs` + `.prettierrc` + las reglas que se
  contradicen entre si.
- **Mucho mas rapido.** Biome esta escrito en Rust.
- **Compatible con el estilo del proyecto**: el `biome.json` ya declara los
  dominios `next` y `react` activados.

### El trade-off asumido

Bun paga su costo de arranque en los **scripts de pegamento de una sola
tarea**: un script que se corre una vez y muere paga ~27 ms de arranque en
frio (o ~4 ms en caliente) contra los ~2 ms de `bash`.

Para un bucle de comandos, eso es despreciable. Para un script que se corre
dentro de otro script, se multiplica.

**La regla que sale de esta decision**: los scripts de pegamento de una sola
tarea, o los que se invocan miles de veces, se escriben en `bash` o en
`python3`, no en TypeScript con Bun. Bun queda para lo que es el stack del
proyecto: el servidor de Next, los tests, los scripts que corren en el
proyecto.

Es exactamente el criterio del punto 4 de abajo.

## Alternativas descartadas

### npm (el default de Node)

Descartado por la dispersion del stack y por el lockfile: es el mas lento de
los tres para instalar y el `package-lock.json` es el peor para revisar. Node
sigue siendo el runtime de Next.js: **Bun no reemplaza a Node en el runtime
de Next**, solo el package manager y el runner de scripts.

### pnpm

Es lo que el repo usaba antes de la migracion, asi que es la alternativa mas
seria. Se descarto porque:

- El store de pnpm requiere un paso extra (`pnpm store prune`) y un
  directorio de store global que hay que managing.
- Los `pnpm-workspace.yaml` disappeared en la migracion: el template es un
  proyecto simple, sin monorepo.
- Rompe la continuidad con el stack de los proyectos derivados.

Migrar de vuelta es posible: `bun install` y `pnpm install` conviven mal en el
mismo repo (lockfiles distintos), asi que el cambio es un `rm bun.lock` mas
un `pnpm install`.

### ESLint + Prettier

Descartado por la duplicacion de herramientas y de configuracion. ESLint con
el plugin de Next ya era lento; sumarle Prettier encima (que hay que
configurar para que no pelee con el formateo de ESLint) es exactamente el
problema que Biome resuelve en un archivo.

El costo de migrar: las reglas de ESLint no tienen equivalencia 1:1 en Biome.
Hay que revisar `.hermes.md` y las reglas del agente, que mencionan
"ESLint clean" en algunos lugares.

### Deno

El runtime de Deno es comparable a Bun en startup, pero el ecosistema de
Next.js esta atado a Node/Bun y no a Deno. Descartado.

### Mantener los dos (Bun para instalar, Node para correr)

Descartado: `bun install` genera un `node_modules` que Node puede correr, pero
los scripts de `package.json` se ejecutan con el shebang que definiste. Mezclar
los dos produce comportamientos distintos entre maquinas. Un solo stack.

## Consecuencias

### Para el que trabaja en el proyecto

**Instalar dependencias:**

```bash
bun install
```

**Correr scripts:**

```bash
bun run dev
bun run build
bun run lint      # biome check
bun run format    # biome format --write
bunx tsc --noEmit
```

**Nunca** generar `package-lock.json` ni `pnpm-lock.yaml`. Si aparece, es un
error: se commitea por error o se genero con el package manager equivocado.

**No instalar ESLint ni Prettier.** Si hace falta una regla que Biome no
trae, primero hay que ver si existe en Biome; si de verdad no existe, se
documenta en `.hermes.md` como convencion manual, no como dependencia.

**Type check aparte de lint.** Biome no verifica tipos: `bunx tsc --noEmit` es
un paso distinto del gate.

### El gate de calidad

```bash
bunx tsc --noEmit   # exit 0 esperado
bun run lint        # 0 errores esperado
bun run build       # compila esperado
```

Los tres estan verificados en estado limpio en este template.

### Para el proyecto derivado

El stack de tooling **congela el template**. Un proyecto que lo clona hereda
Bun + Biome y no necesita decidir nada de tooling.

Si un proyecto derivado necesita ESLint (por una regla de un plugin que no
existe en Biome), esa es una excepcion del **proyecto**, no del template: se
agrega ESLint ahi, en ese proyecto, sin tocar el template.

### Cuando el proyecto **no** usa Bun

Un proyecto puede usar Bun para el stack de Next y escribir sus scripts
auxiliares en `python3` o `bash`. Eso es legitimo y no contradice esta
decision: la decision es sobre el **package manager y el linter del
proyecto**, no sobre el lenguaje de los scripts de una sola tarea.

Lo que no se permite es tener dos package managers o dos linters en el mismo
proyecto.

### Impacto en el contrato

Ninguno. Bun y Biome no aparecen en el shape del payload de datos, ni en la
estructura de carpetas, ni en las variables de entorno. Un proyecto puede
migrar de pnpm a Bun sin tocar una linea de la app (eso es exactamente lo que
se hizo en este repo).

## Archivos relacionados

| Archivo          | Rol                                 |
| ---------------- | ----------------------------------- |
| `package.json`   | Declara `packageManager: bun@1.4.4` |
| `bun.lock`       | El lockfile                         |
| `biome.json`     | Lint + format                       |
| `tsconfig.json`  | TypeScript estricto                 |
| `.hermes.md`     | Las reglas operativas del stack     |
| `docs/README.md` | Indice de la documentacion          |
