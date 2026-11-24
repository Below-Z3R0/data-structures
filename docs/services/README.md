---

type: docs
module: services
status: active
created: 2026-11-09
updated: 2026-11-23
tags: [services, logica, pila, cola, datos]
---

# Services

La capa de servicios: todo lo que **calcula**. Los componentes orquestan y
muestran; los services resuelven.

Hay dos capas con dueños distintos:

```
src/services/                        ← datos del sitio (compartido)
  data/
    site.ts                          → getSiteData(lang): valida y devuelve el payload
    static/
      site.es.json
      site.en.json

src/app/estructuras/services/        ← logica del dominio
  pila.ts                            → logica pura de la PILA
  pila.test.ts
  cola.ts                            → logica pura de la COLA circular
  cola.test.ts
  registro.ts                        → catalogo de TIPOS (EstructuraId)
```

## La regla

> **La logica de una estructura de datos va en
> `src/app/estructuras/services/`, no en el componente.**

Un service:

- No importa React.
- No toca el DOM ni globals.
- No lee `process.env`.
- Se testea de forma aislada.

Si algo necesita estado de React, no es logica de negocio: es UI, y va en el
componente.

## `data/site.ts`

Orquestador de datos. Devuelve el payload del idioma pedido, tipado como
`SitePayload`. Es la unica fuente de datos de la app: ningun componente la
consulta por su cuenta.

```ts
const { content, metadata } = await getSiteData("es");
```

El payload se valida **una vez**, al cargar el modulo, con `SitePayloadSchema`.
Sin ese `parse` el `id` del catalogo entraria como `string` y el `z.enum` no
estrecharia nada; el parseo es lo que hace que un id desconocido falle en el
arranque y no en el navegador.

## `estructuras/services/pila.ts` y `cola.ts`

La logica de cada estructura. Para el modelo en memoria, los algoritmos y los
errores, ver **[`docs/estructuras/README.md`](../estructuras/README.md)**.

```ts
// pila.ts
crearPila()                  → Pila
estaVacia / estaLlena        → boolean
valorCima(pila)              → number | null
meter(pila, valor)           → ResultadoOperacion<Pila>
sacar(pila)                  → ResultadoOperacion<{ pila, valor }>
editarPila(valores)          → ResultadoOperacion<Pila>
registrarEstado(hist, pila)  → HistorialPila
regresar(historial)          → ResultadoOperacion<{ pila, historial }>
valoresPila(pila)            → number[]

// cola.ts
crearCola()                  → Cola
estaVacia / estaLlena        → boolean
numeroElementos / espaciosLibres → number  (NE y EL)
valorFrente / valorFinal     → number | null
insertar(cola, valor)        → ResultadoOperacionCola<Cola>
eliminar(cola)               → ResultadoOperacionCola<{ cola, item }>
editarCola(valores)          → ResultadoOperacionCola<Cola>
registrarEstado(hist, cola)  → HistorialCola
regresar(historial)          → ResultadoOperacionCola<{ cola, historial }>
valoresCola(cola)            → number[]
```

Constantes compartidas: `VALOR_MINIMO` (1), `VALOR_MAXIMO` (99),
`TAMAANO_PILA` y `TAMAANO_COLA` (6).

Los schemas de validacion (`ValorPilaSchema`, `ListaValoresPilaSchema`,
`ValorColaSchema`, `ListaValoresColaSchema`) tambien viven aca: son parte del
dominio, no de la presentacion.

## `estructuras/services/registro.ts`

El catalogo de **tipos** de estructura. `ESTRUCTURA_IDS` es la fuente unica del
tipo `EstructuraId`, y `EstructuraMetadataSchema` lo usa como `z.enum` para
validar el `id` que viene del JSON.

```ts
export const ESTRUCTURA_IDS = ["pila", "cola"] as const;
export type EstructuraId = (typeof ESTRUCTURA_IDS)[number];
```

**El menu NO se alimenta de aca.** El menu lee
`metadata["section.hero"].estructuras` de los dos JSON, que es donde vive el
`label` traducible. `registro.ts` garantiza que ningun JSON pueda nombrar una
estructura que el dominio no implementa.

La receta completa para agregar una estructura esta en
[`docs/estructuras/README.md`](../estructuras/README.md).

## Tests

```bash
bun run test
```

46 casos: 18 de la pila y 28 de la cola. Cubren los estados vacio/lleno, la
edicion completa, el historial de "Regresar", la inmutabilidad y —en la cola—
las dos ramas del wrap-around. El detalle de que prueba cada uno esta en
[`docs/estructuras/tests.md`](../estructuras/tests.md).
