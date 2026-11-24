import { z } from "zod";

/**
 * Logica de la estructura de datos PILA (STACK).
 *
 * Representacion en memoria (segun el profe):
 *
 *   PILA   : arreglo unidimensional con TAMAANO celdas
 *   TAMAANO: constante con la cantidad maxima de elementos
 *   CIMA   : posicion del ultimo elemento agregado (1-based)
 *
 * La pila VACIA tiene CIMA = 0. La pila LLENA tiene CIMA = TAMAANO.
 *
 *   METER (PUSH): si CIMA = TAMAANO -> "PILA LLENA"
 *                 si no            -> CIMA <- CIMA + 1; PILA(CIMA) <- ITEM
 *
 *   SACAR (POP) : si CIMA = 0      -> "PILA VACIA"
 *                 si no            -> ITEM <- PILA(CIMA); CIMA <- CIMA - 1
 *
 * Este modulo es puro: no toca React, ni el DOM, ni globals. Toda la
 * logica de negocio vive aca y se prueba con vitest.
 */

/** Cantidad maxima de celdas de la pila. */
export const TAMAANO_PILA = 6;

/** Valor minimo admitido como elemento de la pila. */
export const VALOR_MINIMO = 1;

/** Valor maximo admitido como elemento de la pila. */
export const VALOR_MAXIMO = 99;

/**
 * Estado completo de la pila.
 *
 * `celdas` es el arreglo PILA de largo TAMAANO_PILA. Las posiciones usadas
 * van de 0 a CIMA - 1 (0-based en el arreglo); el resto vale `null`.
 *
 * `cima` es el valor de la variable CIMA del profe, en base 1: 0 = pila
 * vacia, TAMAANO_PILA = pila llena.
 */
export interface Pila {
  celdas: (number | null)[];
  cima: number;
}

/** Historial de estados para la operacion "Regresar" (deshacer). */
export interface HistorialPila {
  estados: Pila[];
}

/** Error de dominio de la pila. */
export type ErrorPila =
  | "PILA_LLENA"
  | "PILA_VACIA"
  | "VALOR_INVALIDO"
  | "CANTIDAD_INVALIDA";

/** Resultado de una operacion sobre la pila. */
export type ResultadoOperacion<T = undefined> =
  | { ok: true; valor: T }
  | { ok: false; error: ErrorPila };

/**
 * Schema Zod del valor a insertar: entero entre 1 y 99.
 *
 * Se usa en el borde (formulario del modal) y tambien se reutiliza aqui
 * para que el service nunca acepte un dato invalido.
 */
export const ValorPilaSchema = z
  .number()
  .int("El valor debe ser un numero entero")
  .min(VALOR_MINIMO, `El valor debe ser mayor o igual a ${VALOR_MINIMO}`)
  .max(VALOR_MAXIMO, `El valor debe ser menor o igual a ${VALOR_MAXIMO}`);

/** Schema Zod de la lista completa de valores (operacion "Editar"). */
export const ListaValoresPilaSchema = z
  .array(ValorPilaSchema)
  .max(TAMAANO_PILA, `La pila no puede tener mas de ${TAMAANO_PILA} elementos`);

/**
 * Crea una pila vacia: todas las celdas en null y CIMA en 0.
 */
export function crearPila(): Pila {
  return {
    celdas: Array.from({ length: TAMAANO_PILA }, () => null),
    cima: 0,
  };
}

/**
 * Indica si la pila esta vacia (CIMA = 0).
 */
export function estaVacia(pila: Pila): boolean {
  return pila.cima === 0;
}

/**
 * Indica si la pila esta llena (CIMA = TAMAANO).
 */
export function estaLlena(pila: Pila): boolean {
  return pila.cima === TAMAANO_PILA;
}

/**
 * Devuelve el valor que esta en la CIMA, o null si la pila esta vacia.
 */
export function valorCima(pila: Pila): number | null {
  if (estaVacia(pila)) return null;
  return pila.celdas[pila.cima - 1];
}

/**
 * METER (PUSH): agrega un valor en la cima.
 *
 * Falla con "PILA LLENA" si CIMA = TAMAANO, y con "VALOR INVALIDO" si el
 * valor no cumple el schema.
 */
export function meter(pila: Pila, valor: number): ResultadoOperacion<Pila> {
  const parsed = ValorPilaSchema.safeParse(valor);
  if (!parsed.success) {
    return { ok: false, error: "VALOR_INVALIDO" };
  }
  if (estaLlena(pila)) {
    return { ok: false, error: "PILA_LLENA" };
  }

  const celdas = [...pila.celdas];
  celdas[pila.cima] = parsed.data;
  return { ok: true, valor: { celdas, cima: pila.cima + 1 } };
}

/**
 * SACAR (POP): extrae el valor de la cima.
 *
 * Falla con "PILA VACIA" si CIMA = 0.
 */
export function sacar(
  pila: Pila,
): ResultadoOperacion<{ pila: Pila; valor: number }> {
  if (estaVacia(pila)) {
    return { ok: false, error: "PILA_VACIA" };
  }

  const extraido = pila.celdas[pila.cima - 1] as number;
  const celdas = [...pila.celdas];
  celdas[pila.cima - 1] = null;
  return {
    ok: true,
    valor: { pila: { celdas, cima: pila.cima - 1 }, valor: extraido },
  };
}

/**
 * EDICION COMPLETA: reemplaza el contenido de la pila por una lista de
 * valores. El contenido se apila en orden: el primer valor de la lista
 * queda en la base y el ultimo en la cima.
 *
 * Falla con "CANTIDAD INVALIDA" si la lista excede TAMAANO_PILA, y con
 * "VALOR INVALIDO" si algun valor no cumple el schema.
 */
export function editarPila(valores: number[]): ResultadoOperacion<Pila> {
  const parsed = ListaValoresPilaSchema.safeParse(valores);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.code === "too_big" ? "CANTIDAD_INVALIDA" : "VALOR_INVALIDO",
    };
  }

  const celdas: (number | null)[] = Array.from(
    { length: TAMAANO_PILA },
    () => null,
  );
  for (let i = 0; i < parsed.data.length; i++) {
    celdas[i] = parsed.data[i];
  }
  return { ok: true, valor: { celdas, cima: parsed.data.length } };
}

/**
 * Operacion "Regresar": devuelve el estado anterior de la pila.
 *
 * El historial se mantiene aparte: cada operacion que cambia la pila
 * empuja el estado previo. Si no hay historial, la operacion falla.
 */
export function regresar(historial: HistorialPila): ResultadoOperacion<{
  pila: Pila;
  historial: HistorialPila;
}> {
  const anterior = historial.estados.at(-1);
  if (!anterior) {
    return { ok: false, error: "PILA_VACIA" };
  }
  return {
    ok: true,
    valor: {
      pila: anterior,
      historial: { estados: historial.estados.slice(0, -1) },
    },
  };
}

/**
 * Registra el estado actual de la pila en el historial.
 */
export function registrarEstado(
  historial: HistorialPila,
  pila: Pila,
): HistorialPila {
  return { estados: [...historial.estados, pila] };
}

/**
 * Convierte la pila a la lista de valores que contiene (de base a cima).
 */
export function valoresPila(pila: Pila): number[] {
  return pila.celdas.slice(0, pila.cima).filter((v): v is number => v !== null);
}
