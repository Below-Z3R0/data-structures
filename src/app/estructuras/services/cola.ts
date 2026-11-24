import { z } from "zod";
import { VALOR_MAXIMO, VALOR_MINIMO } from "./pila";

/**
 * Logica de la estructura de datos COLA CIRCULAR (QUEUE).
 *
 * Representacion en memoria (segun el profe):
 *
 *   COLA  : arreglo unidimensional con MAX celdas
 *   MAX   : constante con la cantidad maxima de elementos
 *   FRENTE: posicion del primer elemento (1-based, 0 = vacia)
 *   FINAL : posicion del ultimo elemento (1-based, 0 = vacia)
 *
 * Cuando FRENTE o FINAL llegan a MAX, la siguiente operacion los reinicia
 * en 1: ese es el wrap-around del arreglo circular.
 *
 *   INSERCOLA: si LLENA -> "COLA LLENA"
 *              si FRENTE = FINAL = 0 -> FRENTE = 1; FINAL = 1
 *              si FINAL = MAX         -> FINAL = 1
 *              si no                  -> FINAL = FINAL + 1
 *              COLA(FINAL) = ITEM
 *
 *   ELIMCOLA : si VACIA -> "COLA VACIA"
 *              ITEM = COLA(FRENTE)
 *              si FRENTE = FINAL -> FRENTE = 0; FINAL = 0
 *              si FRENTE = MAX   -> FRENTE = 1
 *              si no             -> FRENTE = FRENTE + 1
 *
 * Este modulo es puro: no toca React, ni el DOM, ni globals.
 */

/** Cantidad maxima de celdas de la cola (MAX). */
export const TAMAANO_COLA = 6;

/**
 * Estado completo de la cola circular.
 *
 * `celdas` es el arreglo COLA de largo TAMAANO_COLA. La posicion i del profe
 * (base 1) vive en `celdas[i - 1]` (base 0); las celdas libres valen `null`.
 *
 * `frente` y `final` son las variables del profe, en base 1: ambos valen 0
 * cuando la cola esta vacia.
 */
export interface Cola {
  celdas: (number | null)[];
  frente: number;
  final: number;
}

/** Historial de estados para la operacion "Regresar" (deshacer). */
export interface HistorialCola {
  estados: Cola[];
}

/** Error de dominio de la cola. */
export type ErrorCola =
  | "COLA_LLENA"
  | "COLA_VACIA"
  | "VALOR_INVALIDO"
  | "CANTIDAD_INVALIDA"
  | "sin_historial";

/** Resultado de una operacion sobre la cola. */
export type ResultadoOperacionCola<T = undefined> =
  | { ok: true; valor: T }
  | { ok: false; error: ErrorCola };

/**
 * Schema Zod del valor a insertar: entero entre VALOR_MINIMO y VALOR_MAXIMO.
 * Los limites se reutilizan de la pila para no duplicar el rango.
 */
export const ValorColaSchema = z
  .number()
  .int("El valor debe ser un numero entero")
  .min(VALOR_MINIMO, `El valor debe ser mayor o igual a ${VALOR_MINIMO}`)
  .max(VALOR_MAXIMO, `El valor debe ser menor o igual a ${VALOR_MAXIMO}`);

/** Schema Zod de la lista completa de valores (operacion "Editar"). */
export const ListaValoresColaSchema = z
  .array(ValorColaSchema)
  .max(TAMAANO_COLA, `La cola no puede tener mas de ${TAMAANO_COLA} elementos`);

/** Arreglo COLA nuevo, con todas las celdas libres. */
function celdasVacias(): (number | null)[] {
  return Array.from({ length: TAMAANO_COLA }, () => null);
}

/**
 * Crea una cola vacia: celdas en null, FRENTE = FINAL = 0.
 */
export function crearCola(): Cola {
  return { celdas: celdasVacias(), frente: 0, final: 0 };
}

/**
 * Indica si la cola esta vacia (FRENTE = FINAL = 0).
 */
export function estaVacia(cola: Cola): boolean {
  return cola.frente === 0 && cola.final === 0;
}

/**
 * Indica si la cola esta llena:
 * (FRENTE = 1 y FINAL = MAX) o FRENTE = FINAL + 1.
 */
export function estaLlena(cola: Cola): boolean {
  if (estaVacia(cola)) return false;
  const llenaPorBorde = cola.frente === 1 && cola.final === TAMAANO_COLA;
  const llenaPorContiguedad = cola.frente === cola.final + 1;
  return llenaPorBorde || llenaPorContiguedad;
}

/**
 * Numero de elementos (NE) de la cola circular.
 *
 * Con vuelta (FRENTE > FINAL) la formula suma MAX: el tramo util cruza el
 * corte del arreglo.
 */
export function numeroElementos(cola: Cola): number {
  if (estaVacia(cola)) return 0;
  const tramo = cola.final - cola.frente + 1;
  return cola.frente <= cola.final ? tramo : TAMAANO_COLA + tramo;
}

/**
 * Espacios libres (EL) de la cola: MAX - NE.
 */
export function espaciosLibres(cola: Cola): number {
  return TAMAANO_COLA - numeroElementos(cola);
}

/**
 * Devuelve el valor del FRENTE, o null si la cola esta vacia.
 */
export function valorFrente(cola: Cola): number | null {
  if (estaVacia(cola)) return null;
  return cola.celdas[cola.frente - 1];
}

/**
 * Devuelve el valor del FINAL, o null si la cola esta vacia.
 */
export function valorFinal(cola: Cola): number | null {
  if (estaVacia(cola)) return null;
  return cola.celdas[cola.final - 1];
}

/**
 * INSERCOLA: agrega un valor al FINAL de la cola.
 *
 * Falla con "COLA LLENA" si no hay lugar y con "VALOR INVALIDO" si el valor
 * no cumple el schema.
 */
export function insertar(
  cola: Cola,
  valor: number,
): ResultadoOperacionCola<Cola> {
  const parsed = ValorColaSchema.safeParse(valor);
  if (!parsed.success) {
    return { ok: false, error: "VALOR_INVALIDO" };
  }
  if (estaLlena(cola)) {
    return { ok: false, error: "COLA_LLENA" };
  }

  const celdas = [...cola.celdas];
  let frente = cola.frente;
  let final = cola.final;

  if (frente === 0 && final === 0) {
    frente = 1;
    final = 1;
  } else if (final === TAMAANO_COLA) {
    final = 1; // wrap: el arreglo es circular
  } else {
    final += 1;
  }

  celdas[final - 1] = parsed.data;
  return { ok: true, valor: { celdas, frente, final } };
}

/**
 * ELIMCOLA: extrae el valor del FRENTE.
 *
 * Falla con "COLA VACIA" si FRENTE = FINAL = 0.
 */
export function eliminar(
  cola: Cola,
): ResultadoOperacionCola<{ cola: Cola; item: number }> {
  if (estaVacia(cola)) {
    return { ok: false, error: "COLA_VACIA" };
  }

  const item = cola.celdas[cola.frente - 1];
  if (item == null) return { ok: false, error: "COLA_VACIA" };
  const celdas = [...cola.celdas];
  celdas[cola.frente - 1] = null;

  let frente = cola.frente;
  let final = cola.final;

  if (frente === final) {
    frente = 0;
    final = 0;
  } else if (frente === TAMAANO_COLA) {
    frente = 1; // wrap: el arreglo es circular
  } else {
    frente += 1;
  }

  return { ok: true, valor: { cola: { celdas, frente, final }, item } };
}

/**
 * EDICION COMPLETA: arma la cola desde cero con los valores dados.
 *
 * El primer valor de la lista queda en FRENTE = 1 y el ultimo en
 * FINAL = valores.length. Una lista vacia deja la cola vacia (no es error).
 * Falla con "CANTIDAD INVALIDA" si excede MAX y con "VALOR INVALIDO" si
 * algun valor no cumple el schema.
 */
export function editarCola(valores: number[]): ResultadoOperacionCola<Cola> {
  const parsed = ListaValoresColaSchema.safeParse(valores);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.code === "too_big" ? "CANTIDAD_INVALIDA" : "VALOR_INVALIDO",
    };
  }

  const celdas = celdasVacias();
  for (let i = 0; i < parsed.data.length; i++) {
    celdas[i] = parsed.data[i];
  }

  if (parsed.data.length === 0) {
    return { ok: true, valor: { celdas, frente: 0, final: 0 } };
  }
  return {
    ok: true,
    valor: { celdas, frente: 1, final: parsed.data.length },
  };
}

/**
 * Convierte la cola a la lista de valores que contiene, de FRENTE a FINAL.
 *
 * Recorre en orden circular: si FRENTE > FINAL da la vuelta por el corte.
 */
export function valoresCola(cola: Cola): number[] {
  const salida: number[] = [];
  if (estaVacia(cola)) return salida;

  let posicion = cola.frente;
  const total = numeroElementos(cola);
  for (let i = 0; i < total; i++) {
    const celda = cola.celdas[posicion - 1];
    if (celda !== null) salida.push(celda);
    posicion = posicion === TAMAANO_COLA ? 1 : posicion + 1;
  }
  return salida;
}

/**
 * Registra el estado actual de la cola en el historial.
 */
export function registrarEstado(
  historial: HistorialCola,
  cola: Cola,
): HistorialCola {
  return { estados: [...historial.estados, cola] };
}

/**
 * Operacion "Regresar": devuelve el estado anterior de la cola y consume
 * ese estado del historial. Falla con "sin_historial" si esta vacio.
 */
export function regresar(historial: HistorialCola): ResultadoOperacionCola<{
  cola: Cola;
  historial: HistorialCola;
}> {
  const anterior = historial.estados.at(-1);
  if (!anterior) {
    return { ok: false, error: "sin_historial" };
  }
  return {
    ok: true,
    valor: {
      cola: anterior,
      historial: { estados: historial.estados.slice(0, -1) },
    },
  };
}
