# Tests — dominio de estructuras

> Qué prueba cada test y por qué existe. Si tocás `services/pila.ts` y esta
> tabla deja de coincidir, el doc miente: actualizalo en el mismo commit.

---

## Cómo se corre

```bash
bun run test          # una pasada
bun run test:watch    # en watch
bun run test -- -t "LIFO"   # solo los tests cuyo nombre matchea
```

Cobertura actual: **18 tests, 1 archivo** (`src/app/estructuras/services/pila.test.ts`),
todos verdes.

Los tests son de **lógica pura**: no montan React, no tocan el DOM, no usan
mocks. Importan el servicio y comparan estados. Por eso corren en ~500 ms.

---

## `crearPila` — estado inicial (1 test)

| Test                                          | Qué fija                                                      |
| --------------------------------------------- | ------------------------------------------------------------- |
| `arranca vacia: 6 celdas en null y CIMA en 0` | `celdas.length === TAMAANO_PILA`, todas `null`, `cima === 0`. |

**Por qué existe:** la convención de la cátedra es `CIMA = 0` para pila vacía,
no `-1` ni `null`. El test congela esa decisión.

---

## `meter` (PUSH) — 5 tests

| Test                                                          | Qué fija                                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `incrementa CIMA y guarda el valor en la posicion de la cima` | Tras un push, `cima === 1` y `celdas[0] === valor`.                                       |
| `apila en orden LIFO: el ultimo en entrar queda en la cima`   | Con `[5, 9, 13]`, `cima === 3`, `valorCima === 13`, `celdas === [5,9,13,null,null,null]`. |
| `falla con PILA_LLENA cuando CIMA = TAMAANO`                  | Al llenar las 6 celdas, el intento 7 devuelve `ok: false` y `error: "PILA_LLENA"`.        |
| `rechaza valores fuera del rango 1-99 o no enteros`           | Rechaza `0`, `100`, `-3`, `4.5` con `VALOR_INVALIDO`.                                     |
| `no muta la pila original (inmutabilidad)`                    | Después de `meter(pila, 7)`, la `pila` original sigue en `cima 0` y `celdas[0] null`.     |

**Por qué existen:** los tres primeros son el contrato de la estructura. El
cuarto cubre los dos bordes del rango (inferior y superior) y el caso no entero.
El quinto es el que impide que el estado compartido se corrompa entre
operaciones: si el servicio mutara, el historial de "Regresar" guardaría
referencias al mismo objeto y deshacer no funcionaría.

---

## `sacar` (POP) — 3 tests

| Test                                             | Qué fija                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `devuelve el valor de la cima y decrementa CIMA` | Saca `77`, deja `cima === 0` y `celdas[0] === null`. El retorno es `{ valor, pila }`. |
| `extrae en orden LIFO`                           | Con `[1, 2, 3]` encima, saca `3` y después `2`.                                       |
| `falla con PILA_VACIA cuando CIMA = 0`           | Sacar de una pila recién creada devuelve `error: "PILA_VACIA"`.                       |

**Por qué existen:** el orden LIFO es la propiedad que define la estructura; el
test de secuencia lo verifica de a dos extracciones, no de a una, así que un
`shift` en vez de `pop` lo rompe.

---

## `editarPila` — 4 tests

| Test                                                         | Qué fija                                                                         |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `reemplaza el contenido completo y recalcula CIMA`           | `editarPila([3, 8])` deja `cima === 2` y `celdas === [3,8,null,null,null,null]`. |
| `permite vaciar la pila con una lista vacia`                 | `editarPila([])` deja `cima === 0`. **No** es un error.                          |
| `falla con CANTIDAD_INVALIDA si excede TAMAANO_PILA`         | Con 7 valores devuelve `CANTIDAD_INVALIDA`.                                      |
| `falla con VALOR_INVALIDO si algun valor no cumple el rango` | Con `[1, 0]` devuelve `VALOR_INVALIDO`.                                          |

**Por qué existen:** "Editar" es la operación que reemplaza todo el contenido.
El caso de la lista vacía es el que más se rompe: vaciar y "no hay nada" se
confunden fácil, y acá son estados válidos distintos.

---

## `regresar` (deshacer) — 3 tests

| Test                                                 | Qué fija                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `devuelve el estado anterior y consume el historial` | Con un estado guardado, `regresar` devuelve la pila previa y deja el historial vacío.     |
| `falla si no hay historial`                          | Con historial vacío devuelve `ok: false` y `error: "sin_historial"`.                      |
| `no confunde 'sin_historial' con 'PILA_VACIA'`       | `regresar` sin historial da `sin_historial`; `sacar` con CIMA 0 sigue dando `PILA_VACIA`. |

> **Cambió con A1.** El segundo test esperaba `PILA_VACIA`, que confundía el
> undo sin historial con la pila sin elementos. Ahora `ErrorPila` incluye
> `"sin_historial"` y el tercer test fija que los dos códigos no se mezclen.

**Por qué existen:** "Regresar" es el único mecanismo de undo. El test de
consumo verifica que no se pueda deshacer infinitas veces el mismo paso.

---

## Utilidades — 2 tests

| Test                                              | Qué fija                                                    |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `estaVacia / estaLlena siguen el valor de CIMA`   | Recién creada: `estaVacia === true`, `estaLlena === false`. |
| `valoresPila devuelve los valores de base a cima` | Con `[10, 20]` encima devuelve `[10, 20]`, en ese orden.    |

**Por qué existen:** `valoresPila` es lo que usa "Editar" para precargar el
formulario. Si devolviera el orden invertido, el usuario vería la pila dada
vuelta.

---

## Qué **no** está cubierto hoy

Estos casos no tienen test y son candidatos para el módulo de tests:

| Caso                                           | Riesgo                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| El historial crece sin tope                    | 10 000 inserciones guardan 10 000 snapshots en memoria. `bug BUG-03` del plan. |
| `regresar` con más de un estado                | Solo se prueba con un estado guardado; no se prueba el consumo en cadena.      |
| `editarPila` con valores duplicados            | No hay regla que los prohíba, pero tampoco test que lo declare.                |
| El cast `as number` en `sacar` (`pila.ts:145`) | Si `cima > 0` con celda nula, el `null` pasa como `number`. `bugs.md` B2.      |

---

## Convención para tests nuevos

- Un `describe` por función exportada, un `it` por comportamiento.
- El nombre del `it` describe el **comportamiento observable**, no la
  implementación: `"falla con PILA_LLENA cuando CIMA = TAMAANO"`, no
  `"test 4"`.
- Sin mocks: el servicio es puro. Si necesitás un mock, el código está mal
  separado.
- Un test por rama del código, no por línea.
- Si un test documenta un bug conocido, el nombre lo dice (`BUG-N`) y se
  **invierte** cuando el bug se arregla.

---

## COLA — `cola.test.ts` (28 tests)

Todo lo de arriba aplica igual. La diferencia es **el wrap-around**: la mitad
de estos tests existen para verificar que la cola reaprovecha las celdas
liberadas en lugar de correrse.

### `crearCola` (1)

| Test                                                   | Qué fija                                |
| ------------------------------------------------------ | --------------------------------------- |
| `arranca vacia: FRENTE = FINAL = 0 y 6 celdas en null` | El estado inicial del arreglo circular. |

### `insertar` (7)

| Test                                                     | Qué fija                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| `el primer elemento deja FRENTE = FINAL = 1`             | Consideración (b): el primer insert mueve los dos apuntadores.   |
| `el segundo elemento mueve FINAL a 2 y deja FRENTE en 1` | `FRENTE` no se mueve al insertar.                                |
| `se llena con 6 elementos y el 7 falla con COLA_LLENA`   | `(FRENTE=1, FINAL=MAX)`.                                         |
| **`WRAP DE FINAL`**                                      | Con `FINAL = MAX` y lugar libre, el insert reinicia `FINAL = 1`. |
| `rechaza valores fuera del rango 1-99 o no enteros`      | `0`, `100`, `-3`, `4.5`.                                         |
| `no muta la cola original`                               | Inmutabilidad.                                                   |

### `eliminar` (5)

| Test                                                   | Qué fija                                    |
| ------------------------------------------------------ | ------------------------------------------- |
| `saca el valor del FRENTE (FIFO) y avanza FRENTE`      | El opuesto exacto de `meter` en la pila.    |
| `respeta el orden FIFO: de [1,2,3] sale 1 y despues 2` | Orden de salida.                            |
| `al sacar el unico elemento deja FRENTE = FINAL = 0`   | Consideración (f).                          |
| `falla con COLA_VACIA`                                 | Eliminar de vacía.                          |
| **`WRAP DE FRENTE`**                                   | Con `FRENTE = MAX` el siguiente avanza a 1. |

### `conteo` (5)

| Test                                       | Qué fija                                                         |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `estaLlena con FRENTE = 1 y FINAL = MAX`   | Primera forma de llena.                                          |
| `estaLlena con FRENTE = FINAL + 1`         | Segunda forma de llena.                                          |
| `NE con FRENTE <= FINAL`                   | La rama sin vuelta.                                              |
| **`NE con FRENTE > FINAL`**                | `MAX + (FINAL - FRENTE + 1)`. Es donde más se equivoca la gente. |
| `EL = MAX - NE` en vacía, a medias y llena | Los tres estados.                                                |

### `extremos` (3)

| Test                                                           | Qué fija |
| -------------------------------------------------------------- | -------- |
| `devuelven null en una cola vacia`                             |          |
| `devuelven los valores correctos con la cola a medias`         |          |
| `devuelven los extremos correctos cuando la cola da la vuelta` |          |

### `valoresCola` (2)

| Test                                                          | Qué fija                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `sin vuelta devuelve el orden de insercion`                   |                                                                    |
| **`con vuelta devuelve el orden correcto cruzando el corte`** | Recorre `NE` posiciones desde `FRENTE` salvando el corte en `MAX`. |

### `editarCola` (4)

| Test                                                         | Qué fija        |
| ------------------------------------------------------------ | --------------- |
| `reemplaza el contenido y recalcula FRENTE = 1, FINAL = n`   |                 |
| `una lista vacia deja FRENTE = FINAL = 0 (no es error)`      | Vaciar ≠ error. |
| `falla con CANTIDAD_INVALIDA si excede 6`                    |                 |
| `falla con VALOR_INVALIDO si algun valor no cumple el rango` |                 |

### `regresar` (2)

| Test                                                 | Qué fija |
| ---------------------------------------------------- | -------- |
| `devuelve el estado anterior y consume el historial` |          |
| `falla con sin_historial si el historial esta vacio` |          |

### Los tres que atrapan el wrap

`WRAP DE FINAL`, `NE con FRENTE > FINAL` y `valoresCola con vuelta`. Si los
tres pasan pero el escenario no cruza el corte, el test no prueba nada: cada
uno arma el estado con operaciones reales y afirma los apuntadores
resultantes (`FINAL = 1` con `FRENTE = 2`, `FRENTE = MAX` con `FINAL = 1`).

---

## Cobertura de la UI

No hay tests de componentes. La UI es una capa fina sobre los servicios, y se
verifica en el browser: insertar, eliminar, regresar, editar, los dos idiomas
y el panel de estado. Si aparecen bugs de interacción, el primer paso es
escribir el test de la función pura que falla, no el del componente.
