---

type: decision
status: active
created: 2026-11-09
tags: [decision, pila, cima, ed1]
---

# Decision: CIMA es base 1

## Contexto

La PILA se puede modelar de dos maneras, y el enunciado no las
distingue:

1. **CIMA = indice del ultimo elemento (base 1).** Pila vacia: `CIMA = 0`.
   Llena: `CIMA = TAMAÑO`. Es el pseudocodigo de la catedra.
2. **CIMA = proxima celda libre (base 0).** Pila vacia: `CIMA = 0`.
   Llena: `CIMA = TAMAÑO - 1`.

Las dos se ven iguales en los extremos, pero difieren en el medio: con la
opcion 2, una pila con 3 elementos tiene `CIMA = 3`, y la celda del tope
es la **4**. Con la opcion 1, `CIMA = 3` y la celda del tope es la **3**.

El material del profesor (clases 9 a 12) es inequivoco:

```
ALGORITMO METER ( ITEM )
    SI CIMA = TAMAÑO ENTONCES
        ESCRIBIR "PILA LLENA"
    DE OTRO MODO
        CIMA ← CIMA + 1
        PILA ( CIMA ) ← ITEM
```

Con la opcion 2, `CIMA = TAMAÑO` solo se alcanzaria en la iteracion
siguiente a llenar la pila: el error "PILA LLENA" llegaria tarde.

## Decision

**`CIMA` es base 1**: indica la posicion (1 a `TAMAÑO`) del ultimo
elemento agregado.

- Pila vacia: `CIMA = 0`.
- Pila llena: `CIMA = TAMAÑO = 6`.
- La celda del tope vive en `celdas[cima - 1]` (el array es 0-based, la
  variable no).

```
   ┌─────┬─────┬─────┬─────┬─────┬─────┐
   │  A  │  C  │  D  │  F  │  K  │  -  │
   └─────┴─────┴─────┴─────┴─────┴─────┘
     pos 1   2    3    4    5    6
                              ▲
                            CIMA = 5
```

## Alternativas descartadas

| Alternativa                         | Por que no                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| **CIMA base 0 (proxima libre)**     | Contradice el pseudocodigo de la catedra y desplaza el error de pila llena.            |
| **CIMA = valor del tope**           | Pierde la posicion: con dos pilas `[1,7]` y `[7,1]` la variable no las distingue.      |
| **Indice 1-based dentro del array** | Un array con `indice 0` sin usar es un desperdicio; la conversion va en un solo lugar. |

## Consecuencias

- `estaVacia(pila)` es `cima === 0`; `estaLlena(pila)` es
  `cima === TAMAANO_PILA`. Sin off-by-one.
- `meter` escribe en `celdas[cima]` (la posicion siguiente) y luego
  incrementa: es literalmente el pseudocodigo.
- `sacar` lee `celdas[cima - 1]` y luego decrementa.
- La representacion grafica marca la celda `cima - 1` del array (0-based)
  con la flecha, y el indice que se muestra al usuario es `cima` (base 1).
- La conversion array ↔ CIMA esta en un solo lugar por operacion. Si
  alguna vez hay que cambiar de convencion, el cambio es local.
