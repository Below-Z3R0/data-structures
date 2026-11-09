---

type: decision
status: active
created: 2026-11-09
tags: [decision, arquitectura, services, testing]
---

# Decision: La logica de la estructura va en services

## Contexto

Una estructura de datos como la PILA tiene logica real: METER, SACAR,
los limites (PILA LLENA / PILA VACIA), el calculo de CIMA, el historial
de "Regresar". Esa logica se puede escribir de dos maneras:

1. Dentro del componente de React, que maneja el estado.
2. En un modulo aparte, sin dependencias de UI.

La opcion 1 es la que hacen casi todos los proyectos de este tipo, y
funciona... hasta que querés verificar los casos limite.

## Decision

**Toda la logica de la estructura va en `src/services/data-structures/`,
en codigo puro.** El componente solo la orquesta y la muestra.

```ts
// src/services/data-structures/pila.ts
export function meter(pila: Pila, valor: number): ResultadoOperacion<Pila>;
export function sacar(pila: Pila): ResultadoOperacion<{ pila; valor }>;
```

Un service:

- No importa React.
- No toca el DOM ni globals.
- No lee `process.env`.
- No muta sus argumentos: devuelve uno nuevo.

Los errores se devuelven como valores (`{ ok: false, error }`), nunca se
lanzan: el componente decide que hacer con cada caso.

## Alternativas descartadas

| Alternativa                       | Por que no                                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Logica dentro del componente**  | Los casos limite (pila llena, pila vacia, valor invalido) solo se prueban a mano.                                                       |
| **Clase `Pila` con metodos**      | El estado del componente es un objeto plano; una clase obliga a mezclar `this` con el estado de React.                                  |
| **Global mutable**                | Dos componentes que compartan la pila se desincronizan. La inmutabilidad lo evita.                                                      |
| **`useReducer` en el componente** | El reducer tambien es codigo puro, pero vive en el archivo del componente: no se testea aislado ni se documenta como parte del dominio. |

## Consecuencias

- `pila.test.ts` tiene 17 casos y corre en milisegundos, sin montar nada.
- Agregar una operacion es: una funcion pura + su test.
- El componente `PilaSection` se lee como una GUI: traduce clics a
  llamadas del service y renderiza el resultado.
- Los schemas de validacion (`ValorPilaSchema`) viven junto a la
  logica: son parte del dominio, no de la presentacion.
