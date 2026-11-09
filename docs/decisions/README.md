# Decisiones tecnicas

Registro de decisiones con contexto. Cada documento explica **que** se decidio,
**por que** y **que alternativas** se descartaron.

## Como escribir una decision

Nombre del archivo en `kebab-case`, sin fecha ni numeracion. Ejemplo:
`data-source-switch.md`.

Contenido minimo:

```md
# Decision: <titulo>

## Contexto

<Que problema resuelve>

## Decision

<Que se decidio>

## Alternativas descartadas

<Que se considero y por que no>

## Consecuencias

<Que cambia para el que trabaja en el proyecto>
```

Un documento mas, con frontmatter:

```md
---

type: decision
status: active
created: 2026-11-09
tags: [decision, ...]
---
```

## Decisiones registradas

| Documento                | Decision                                                         |
| ------------------------ | ---------------------------------------------------------------- |
| `package-manager-bun.md` | Bun como package manager, Biome como linter, TypeScript estricto |
| `data-source-switch.md`  | Dos modos de datos (Supabase y estatico) con el mismo contrato   |

## Que decisiones faltan

La auditoria de `docs/template-guide.md` identifica decisiones que todavia no
estan escritas y que serian utiles:

| Decision candidata                            | Por que                                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Eliminacion del route group `(public)`**    | La carpeta `(public)/` fue eliminada en la migracion y la razon no quedo registrada |
| **El route group `(admin)` y el panel admin** | Por que `(admin)` y no `/admin` protegido con un middleware                         |
| **Versionado del template**                   | No hay CHANGELOG, no hay tags, no hay politica de semver                            |

Cuando se escriba una decision, sumala a la tabla de arriba.
