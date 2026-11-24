---

type: docs
module: estructuras
status: active
created: 2026-11-09
tags: [estructuras, pila, stack, ed1, lifo]
---

# Estructuras de datos

Las estructuras de datos que la app puede representar. Por ahora hay una
sola: **PILA**. El menu de la cabecera es generico: renderiza un boton por
cada entrada de `metadata["section.hero"].estructuras` de los JSON, asi que
agregar una estructura es agregar su entrada al payload (ver la receta al
final).

---

## La PILA (STACK)

### Que es

Una estructura lineal **LIFO** (_Last In, First Out_): los elementos se
meten y se sacan por el mismo extremo, llamado **CIMA**. El ultimo
elemento que entra es el primero que sale.

Es una estructura **estatica**: el arreglo tiene tamano fijo y la CIMA se
mueve dentro de ese rango.

### Como se representa en memoria

Tres variables, segun el modelo de la catedra:

| Variable | Significado                                    | Valores       |
| -------- | ---------------------------------------------- | ------------- |
| `PILA`   | Arreglo unidimensional con `TAMAÑO` celdas     | 6 celdas      |
| `TAMAÑO` | Cantidad maxima de elementos                   | 6             |
| `CIMA`   | Posicion del ultimo elemento agregado (base 1) | 0 (vacia) a 6 |

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

La logica esta en `src/app/estructuras/services/pila.ts`. Es **puro**: sin
React, sin DOM, sin globals. Por eso se testea de forma trivial.

```ts
const pila = crearPila(); // { celdas: [null x6], cima: 0 }

meter(pila, 42); // ok -> { celdas: [42, null x5], cima: 1 }
sacar(pila); // ok -> { pila: {...}, valor: 42 }
editarPila([5, 12, 30]); // ok -> reemplaza todo el contenido
regresar(historial); // ok -> vuelve al estado anterior
```

| Concepto         | Funcion / constante                         |
| ---------------- | ------------------------------------------- |
| `PILA`           | `Pila.celdas` (array de 6, `null` libre)    |
| `TAMAÑO = 6`     | `TAMAANO_PILA`                              |
| `CIMA`           | `Pila.cima`                                 |
| PILA VACIA       | `estaVacia(pila)` / `cima === 0`            |
| PILA LLENA       | `estaLlena(pila)` / `cima === TAMAANO_PILA` |
| Valor de la cima | `valorCima(pila)`                           |
| METER            | `meter(pila, valor)`                        |
| SACAR            | `sacar(pila)`                               |
| Editar todo      | `editarPila(valores)`                       |
| REGRESAR         | `regresar(historial)` + `registrarEstado`   |

> **Ojo con el base.** `CIMA` es base 1 (como en el pseudocodigo), pero el
> array es 0-based. El valor de la cima vive en `celdas[cima - 1]`.

### Los errores

La estructura devuelve un discriminated union, nunca lanza:

```ts
type ResultadoOperacion<T> =
  | { ok: true; valor: T }
  | { ok: false; error: ErrorPila };

type ErrorPila =
  | "PILA_LLENA" // CIMA = TAMAÑO: no entra más
  | "PILA_VACIA" // CIMA = 0: no hay nada que sacar
  | "VALOR_INVALIDO" // no es entero, o no está entre 1 y 99
  | "CANTIDAD_INVALIDA" // la lista excede las 6 celdas
  | "sin_historial"; // regresar() sin estados previos
```

| Error               | Cuando                          | Que ve el usuario             |
| ------------------- | ------------------------------- | ----------------------------- |
| `PILA_LLENA`        | Meter con `CIMA = 6`            | Modal: "La pila está llena"   |
| `PILA_VACIA`        | Sacar con `CIMA = 0`            | Modal: "La pila está vacía"   |
| `VALOR_INVALIDO`    | Valor no entero o fuera de 1-99 | Modal: "Debe ser 1 a 99"      |
| `CANTIDAD_INVALIDA` | Editar con mas de 6 valores     | Modal: "Máximo 6 elementos"   |
| `sin_historial`     | Regresar sin estados previos    | Modal: "No hay estado previo" |

Los errores de la estructura **se muestran en un modal**, no en
`src/app/error.tsx`: el usuario no pierde el contexto de la operacion.
`error.tsx` queda para errores inesperados de la pagina.

### El flujo en la UI

```
PilaSection (17 lineas)
  └─ EstructuraSection<Pila>  (generico, "use client")
       ├─ estado: pila, historial, modal abierto, error, valorInsercion, valoresEdicion
       ├─ PilaVisualizer              → PilaCell x6
       ├─ botones: Insertar / Eliminar / Regresar / Editar
       └─ Modal x4  (FieldInput solo en insertar y editar)
```

| Boton    | Accion                | Modal                   |
| -------- | --------------------- | ----------------------- |
| Insertar | `meter(pila, valor)`  | Formulario con un valor |
| Eliminar | `sacar(pila)`         | Confirmacion            |
| Regresar | `regresar(historial)` | No                      |
| Editar   | `editarPila(valores)` | Formulario con la lista |

"Regresar" usa un **historial**: antes de cada operacion que cambia la
pila, el estado anterior se apila. `regresar()` saca el ultimo y lo
restaura. El boton se deshabilita cuando el historial esta vacio.

### Validacion

Un valor llega al service pasando por dos reglas distintas, y conviene saber
cual manda en cada capa:

| Capa                             | Regla                                               | Que atrapa                                    |
| -------------------------------- | --------------------------------------------------- | --------------------------------------------- |
| Formulario (`EstructuraSection`) | regex `/^\d+$/` sobre el texto                      | que no sea digitos: vacio, `-3`, `4.5`, `abc` |
| Service (`pila.ts` / `cola.ts`)  | `ValorPilaSchema` / `ValorColaSchema`               | rango y tipo: entero entre 1 y 99             |
| Edicion completa                 | `ListaValoresPilaSchema` / `ListaValoresColaSchema` | cantidad (maximo 6) y el rango de cada valor  |

La regex del borde es una comodidad del input; la validacion que **manda** es la
del service, porque tambien protege a quien lo llame por otro camino.

## La COLA (QUEUE)

### Que es

Estructura lineal **FIFO**: el primero que entra es el primero que sale. Se
inserta por un extremo (`FINAL`) y se elimina por el otro (`FRENTE`).

### Como se representa en memoria

Arreglo **circular** de 6 celdas. `FRENTE` y `FINAL` son apuntadores en base 1
que valen `0` cuando la cola esta vacia. Cuando un apuntador llega a `MAX`
vuelve a `1`: no se corre el arreglo, se reutilizan las celdas liberadas al
frente.

```
COLA   [ 30 | 40 | -- | -- | -- | 10 ]
         1    2    3    4    5    6
              ^                   ^
           FRENTE               FINAL
```

En este ejemplo `FRENTE = 2`, `FINAL = 6`, `NE = 5` (2,3,4,5,6) y el proximo
insert va a la celda 1, que es la que quedo libre.

### Las nueve consideraciones

| Situacion                   | Condicion                                           |
| --------------------------- | --------------------------------------------------- |
| COLA vacia                  | `FRENTE = FINAL = 0`                                |
| Insertar el primer elemento | `FRENTE = FINAL = 1`                                |
| Insertar un elemento        | `FINAL = FINAL + 1`                                 |
| Eliminar un elemento        | `FRENTE = FRENTE + 1`                               |
| Un solo elemento            | `FRENTE = FINAL ≠ 0`                                |
| Eliminar el unico elemento  | `FRENTE = FINAL = 0`                                |
| Insertar con `FINAL = MAX`  | `FINAL = 1`                                         |
| Eliminar con `FRENTE = MAX` | `FRENTE = 1`                                        |
| COLA llena                  | `(FRENTE = 1 y FINAL = MAX)` o `FRENTE = FINAL + 1` |

### Los algoritmos

**INSERTAR (INSERCOLA):**

```
si estaLlena         -> COLA_LLENA
si FRENTE=0 y FINAL=0 -> FRENTE=1, FINAL=1
sino si FINAL=MAX    -> FINAL=1
sino                 -> FINAL++
COLA[FINAL] = valor
```

**ELIMINAR (ELIMCOLA):**

```
si FRENTE=0 y FINAL=0 -> COLA_VACIA
item = COLA[FRENTE]
si FRENTE=FINAL      -> FRENTE=0, FINAL=0
sino si FRENTE=MAX   -> FRENTE=1
sino                 -> FRENTE++
```

**Conteo:**

```
NE = FRENTE <= FINAL ? FINAL - FRENTE + 1 : MAX + (FINAL - FRENTE + 1)
EL = MAX - NE
```

Las dos ramas de `NE` importan: cuando la cola dio la vuelta, `FRENTE > FINAL`
y el tramo se calcula sumando `MAX`.

### En el codigo

`src/app/estructuras/services/cola.ts`, mismas reglas que la pila: funciones
puras, sin React ni DOM, con Zod validando la entrada.

| Funcion                              | Que hace                                              |
| ------------------------------------ | ----------------------------------------------------- |
| `crearCola()`                        | 6 celdas en `null`, `FRENTE = FINAL = 0`              |
| `insertar(cola, valor)`              | INSERCOLA con wrap de `FINAL`                         |
| `eliminar(cola)`                     | ELIMCOLA con wrap de `FRENTE` y reset `0/0` al vaciar |
| `editarCola(valores)`                | Reemplaza el contenido: `FRENTE = 1`, `FINAL = n`     |
| `regresar(historial)`                | Deshacer, igual que en la pila                        |
| `numeroElementos` / `espaciosLibres` | `NE` y `EL`                                           |
| `valorFrente` / `valorFinal`         | Extremos, `null` si esta vacia                        |
| `valoresCola(cola)`                  | Recorre de `FRENTE` a `FINAL` salvando el corte       |

### Los errores

| Codigo              | Cuando                           |
| ------------------- | -------------------------------- |
| `COLA_LLENA`        | Insertar con la cola llena       |
| `COLA_VACIA`        | Eliminar de una cola vacia       |
| `VALOR_INVALIDO`    | Valor fuera de 1..99 o no entero |
| `CANTIDAD_INVALIDA` | "Editar" con mas de 6 valores    |
| `sin_historial`     | "Regresar" sin estados guardados |

### El flujo en la UI

`ColaSection` solo conecta los datos con el genérico; `ColaVisualizer` dibuja
las celdas y el panel; `ColaCell` es una celda con sus badges.

```
ColaSection (17 lineas)
  +-> EstructuraSection<Cola>  (el mismo generico que usa la pila)
        |  useState: cola, historial, modalAbierto, errorMensaje, valorInsercion, valoresEdicion
        |  llama a services/cola.ts (funciones puras) via colaAdapter
        +-> ColaVisualizer
        |     +-> ColaCell x6  (badge FRENTE y/o FINAL arriba de la celda)
        +-> Modal x4  (insertar / eliminar / editar / error)
```

El flujo de los modales y del historial es **el mismo** para las dos
estructuras: vive una sola vez en `EstructuraSection`.

**El panel de estado siempre esta visible:** `FRENTE`, `FINAL`, `MAX`,
`ELEMENTOS` (NE) y `LIBRES` (EL), mas el badge `COLA VACIA` / `COLA LLENA`.

**Una celda ocupada no es lo mismo que una celda con valor.** Despues de un
wrap, una celda con `null` puede estar _dentro_ del rango `FRENTE..FINAL`
(por ejemplo si se elimino ese elemento pero el apuntador aun no paso). El
visualizador no usa `!== null` para pintar: calcula el conjunto de posiciones
ocupadas recorriendo `NE` posiciones desde `FRENTE`, con la misma logica que
`valoresCola`.

## Agregar una estructura nueva

El menu se alimenta del payload, no de `registro.ts`: `page.tsx` pasa
`metadata["section.hero"].estructuras` a `EstructurasContainer`, que
renderiza un boton por entrada. `services/registro.ts` es el catalogo de
**tipos** (`ESTRUCTURA_IDS` / `EstructuraId`): el enum con el que
`EstructuraMetadataSchema` valida el `id` que viene del JSON.

1. Agregar el id a `ESTRUCTURA_IDS` en
   `src/app/estructuras/services/registro.ts`. Sin este paso el schema
   rechaza el payload y el build falla.
2. Crear `src/app/estructuras/services/<nombre>.ts` con la logica pura y
   su archivo de tests al lado.
3. Agregar la entrada (`id`, `label`, `description`) a
   `metadata["section.hero"].estructuras` en **los dos** JSON estaticos
   (`src/services/data/static/site.es.json` y `site.en.json`). Este es el
   paso que hace aparecer el boton en el menu.
4. Agregar el componente que la dibuja en `src/app/estructuras/components/`
   y renderizarlo en `EstructurasContainer` dentro del `map` del catalogo,
   con el patron `hidden` para no desmontar la estructura inactiva.
5. Agregar el contenido (textos, labels, errores) al `content` del JSON de
   ambos idiomas, en `section.pila` o en una seccion nueva.
6. Si la estructura necesita su propia seccion en el payload: definí el
   schema en `app/estructuras/schemas.ts`, ampliá el tipo `SiteContent` en
   `services/data/site.ts` y agregá la clave en los dos JSON estaticos.
