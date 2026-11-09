---

type: docs
module: decisions
status: active
created: 2026-11-09
tags: [decisions, arquitectura]
---

# Decisiones tecnicas

Registro de decisiones con contexto. Cada documento explica **que** se
decidio, **por que** y **que alternativas** se descartaron.

## Como escribir una decision

Nombre del archivo en `kebab-case`, sin fecha ni numeracion. Ejemplo:
`datos-estaticos-sin-backend.md`.

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

| Documento                        | Decision                                                          |
| -------------------------------- | ----------------------------------------------------------------- |
| `package-manager-bun.md`         | Bun como package manager, Biome como linter, TypeScript estricto  |
| `datos-estaticos-sin-backend.md` | Datos locales en JSON, sin Supabase ni autenticacion              |
| `logica-en-services.md`          | La logica de la estructura va en `services/`, no en el componente |
| `cima-base-uno.md`               | `CIMA` es base 1, igual que el pseudocodigo de la catedra         |
