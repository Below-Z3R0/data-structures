---
type: docs
module: services
status: active
created: 2026-11-09
tags: [services, logica, pila, datos]
---

# Services

La capa de servicios: todo lo que **calcula**. Los componentes orquestan
y muestran; los services resuelven.

```
src/services/
  data/
    site.ts                       → getSiteData(lang): valida y devuelve el payload
    static/
      site.es.json                → datos en espanol
      site.en.json                → datos en ingles
  data-structures/
    pila.ts                       → logica pura de la PILA
    pila.test.ts                  → tests de esa logica
    structures.ts                 → registro de estructuras disponibles
```

## La regla

> **La logica de una estructura de datos va en `src/services/`, no en el
> componente.**

Un service:

- No importa React.
- No toca el DOM ni globals.
- No lee `process.env`.
- Se testea de forma aislada.

Si algo necesita estado de React, no es logica de negocio: es UI, y va
en el componente.

## `data/site.ts`

Orquestador de datos. Valida el payload contra los schemas de Zod y lo
devuelve con la forma `SitePayload`. Es la unica fuente de datos de la
app: ningun componente la consulta por su cuenta.

```ts
const { content, metadata } = await getSiteData("es");
```

Sin cache ni red: el origen es local.

## `data-structures/pila.ts`

La logica de la PILA. Ver
**[`docs/structures/README.md`](../structures/README.md)** para el
detalle del modelo en memoria, los algoritmos y los errores.

Resumen de la API:

```ts
crearPila()                  → Pila
estaVacia(pila)              → boolean
estaLlena(pila)              → boolean
valorCima(pila)              → number | null
meter(pila, valor)           → ResultadoOperacion<Pila>
sacar(pila)                  → ResultadoOperacion<{ pila, valor }>
editarPila(valores)          → ResultadoOperacion<Pila>
registrarEstado(hist, pila)  → HistorialPila
regresar(historial)          → ResultadoOperacion<{ pila, historial }>
valoresPila(pila)            → number[]
```

Constantes: `TAMAANO_PILA` (6), `VALOR_MINIMO` (1), `VALOR_MAXIMO` (99).

Los schemas de validacion (`ValorPilaSchema`, `ListaValoresPilaSchema`)
tambien viven aca: son parte del dominio, no de la presentacion.

## `data-structures/structures.ts`

El registro de estructuras de datos que la app puede mostrar. Agregar
una entrada es lo que hace que aparezca en el menu.

```ts
export const ESTRUCTURAS: EstructuraInfo[] = [
  { id: "pila", label: "Pila", description: "Ultimo en entrar, primero en salir (LIFO)" },
];
```

El `id` es el identificador tecnico; `label` y `description` son
traducibles, asi que el menu los toma del payload estatico
(`metadata["section.hero"].estructuras`).

## Tests

```bash
bunx vitest run
```

La logica de la pila esta cubierta con 17 casos: METER, SACAR, los
estados vacio/lleno, la edicion completa, el historial de "Regresar" y
la inmutabilidad (las funciones no mutan el argumento: devuelven uno
nuevo).
