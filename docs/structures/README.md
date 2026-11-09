---
type: docs
module: structures
status: active
created: 2026-11-09
tags: [estructuras, pila, stack, ed1, lifo]
---

# Estructuras de datos

Las estructuras de datos que la app puede representar. Por ahora hay una
sola: **PILA**. El menu de la cabecera esta preparado para agregar mas.

---

## La PILA (STACK)

### Que es

Una estructura lineal **LIFO** (*Last In, First Out*): los elementos se
meten y se sacan por el mismo extremo, llamado **CIMA**. El ultimo
elemento que entra es el primero que sale.

Es una estructura **estatica**: el arreglo tiene tamano fijo y la CIMA se
mueve dentro de ese rango.

### Como se representa en memoria

Tres variables, segun el modelo de la catedra:

| Variable   | Significado                                      | Valores          |
| ---------- | ------------------------------------------------ | ---------------- |
| `PILA`     | Arreglo unidimensional con `TAMAÑO` celdas       | 6 celdas         |
| `TAMAÑO`   | Cantidad maxima de elementos                     | 6                |
| `CIMA`     | Posicion del ultimo elemento agregado (base 1)   | 0 (vacia) a 6    |

```
   PILA (arreglo unidimensional)
   ┌─────┬─────┬─────┬─────┬─────┬─────┐
   │  A  │  C  │  D  │  F  │  K  │  -  │
   └─────┴─────┴─────┴─────┴─────┴─────┘
     pos 1   2    3    4    5    6
                              ▲
                              │
                            CIMA = 5
                            TAMAÑO = 6

   PILA VACÍA:  CIMA = 0
   PILA LLENA:  CIMA = TAMAÑO
```

La diferencia con un arreglo normal: en una PILA **solo se accede al
elemento de la CIMA**. No se puede tocar el del medio o el del final sin
desapilar todos los de arriba.

### Los algoritmos

**METER (PUSH)**

```
SI CIMA = TAMAÑO ENTONCES
    ESCRIBIR "PILA LLENA"
DE OTRO MODO
    CIMA ← CIMA + 1
    PILA ( CIMA ) ← ITEM
```

**SACAR (POP)**

```
SI CIMA = 0 ENTONCES
    ESCRIBIR "PILA VACIA"
DE OTRO MODO
    ITEM ← PILA ( CIMA )
    CIMA ← CIMA - 1
```

El `ITEM` es una variable de salida: por eso en el codigo `sacar()`
devuelve `{ pila, valor }` y no solo la pila nueva.

### En el codigo

La logica esta en `src/services/data-structures/pila.ts`. Es **puro**: sin
React, sin DOM, sin globals. Por eso se testea de forma trivial.

```ts
const pila = crearPila();        // { celdas: [null x6], cima: 0 }

meter(pila, 42);                 // ok -> { celdas: [42, null x5], cima: 1 }
sacar(pila);                     // ok -> { pila: {...}, valor: 42 }
editarPila([5, 12, 30]);         // ok -> reemplaza todo el contenido
regresar(historial);             // ok -> vuelve al estado anterior
```

| Concepto          | Funcion / constante                    |
| ----------------- | -------------------------------------- |
| `PILA`            | `Pila.celdas` (array de 6, `null` libre) |
| `TAMAÑO = 6`      | `TAMAANO_PILA`                          |
| `CIMA`            | `Pila.cima`                             |
| PILA VACIA        | `estaVacia(pila)` / `cima === 0`        |
| PILA LLENA        | `estaLlena(pila)` / `cima === TAMAANO`   |
| Valor de la cima  | `valorCima(pila)`                       |
| METER             | `meter(pila, valor)`                    |
| SACAR             | `sacar(pila)`                           |
| Editar todo       | `editarPila(valores)`                   |
| REGRESAR          | `regresar(historial)` + `registrarEstado` |

> **Ojo con el base.** `CIMA` es base 1 (como en el pseudocodigo), pero el
> array es 0-based. El valor de la cima vive en `celdas[cima - 1]`.

### Los errores

La estructura devuelve un discriminated union, nunca lanza:

```ts
type ResultadoOperacion<T> =
  | { ok: true; valor: T }
  | { ok: false; error: ErrorPila };

type ErrorPila =
  | "PILA_LLENA"       // CIMA = TAMAÑO: no entra más
  | "PILA_VACIA"       // CIMA = 0: no hay nada que sacar
  | "VALOR_INVALIDO"   // no es entero, o no está entre 1 y 99
  | "CANTIDAD_INVALIDA"; // la lista excede las 6 celdas
```

| Error                | Cuando                                              | Que ve el usuario            |
| -------------------- | ---------------------------------------------------- | ---------------------------- |
| `PILA_LLENA`         | Meter con `CIMA = 6`                                 | Modal: "La pila está llena"  |
| `PILA_VACIA`         | Sacar con `CIMA = 0`                                  | Modal: "La pila está vacía"  |
| `VALOR_INVALIDO`     | Valor no entero o fuera de 1-99                       | Modal: "Debe ser 1 a 99"      |
| `CANTIDAD_INVALIDA`  | Editar con mas de 6 valores                           | Modal: "Máximo 6 elementos"   |
| `sin_historial`      | Regresar sin estados previos                          | Modal: "No hay estado previo" |

Los errores de la estructura **se muestran en un modal**, no en
`src/app/error.tsx`: el usuario no pierde el contexto de la operacion.
`error.tsx` queda para errores inesperados de la pagina.

### El flujo en la UI

```
PilaSection (organism, "use client")
  ├─ estado: pila, historial, modal abierto
  ├─ PilaVisualizer (molecule)   → PilaCell (atom) x6
  ├─ botones: Insertar / Eliminar / Regresar / Editar
  └─ Modal (molecule) x4         → PilaInput (atom)
```

| Boton      | Accion                                | Modal                  |
| ---------- | ------------------------------------- | ---------------------- |
| Insertar   | `meter(pila, valor)`                  | Formulario con un valor |
| Eliminar   | `sacar(pila)`                         | Confirmacion            |
| Regresar   | `regresar(historial)`                 | No                     |
| Editar     | `editarPila(valores)`                 | Formulario con la lista |

"Regresar" usa un **historial**: antes de cada operacion que cambia la
pila, el estado anterior se apila. `regresar()` saca el ultimo y lo
restaura. El boton se deshabilita cuando el historial esta vacio.

### Validacion

Los valores se validan con **Zod** en el borde (`ValorPilaSchema`):

```ts
z.number()
  .int("El valor debe ser un numero entero")
  .min(1).max(99)
```

El mismo schema se usa en el service, asi que la logica nunca acepta un
dato invalido aunque el service se use por otro camino.

### Agregar una estructura nueva

1. Crear `src/services/data-structures/<nombre>.ts` con la logica pura y
   su archivo de tests al lado.
2. Registrar la estructura en `src/services/data-structures/structures.ts`.
3. Agregar el componente que la dibuja en `components/organisms/`.
4. Agregar el contenido (textos, labels, errores) al JSON estatico de
   ambos idiomas, en `section.pila` o en una seccion nueva.
5. Si la estructura necesita su propia seccion en el payload: definí el
   schema en `components/schemas.ts`, registralo en `CONTENT_SCHEMAS` de
   `services/data/site.ts` y ampliá el tipo `SiteContent`.
