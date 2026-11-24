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

Cobertura actual: **17 tests, 1 archivo** (`src/app/estructuras/services/pila.test.ts`),
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

## `regresar` (deshacer) — 2 tests

| Test                                                 | Qué fija                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `devuelve el estado anterior y consume el historial` | Con un estado guardado, `regresar` devuelve la pila previa y deja el historial vacío. |
| `falla si no hay historial`                          | Con historial vacío devuelve `ok: false`.                                             |

> **Cambia con A1.** Hoy el segundo test espera `PILA_VACIA`, que el
> `bugs.md` marca como incorrecto: `regresar` sin historial no es "pila vacía".
> Cuando se cierre A1, `ErrorPila` gana `"sin_historial"` y este test tiene que
> esperar **ese** código. El test se invierte, no se borra.

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
