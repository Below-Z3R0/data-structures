import { describe, expect, it } from "vitest";
import {
  crearPila,
  type ErrorPila,
  editarPila,
  estaLlena,
  estaVacia,
  meter,
  registrarEstado,
  regresar,
  sacar,
  TAMAANO_PILA,
  valorCima,
  valoresPila,
} from "./pila";

describe("crearPila", () => {
  it("arranca vacia: 6 celdas en null y CIMA en 0", () => {
    const pila = crearPila();
    expect(pila.celdas).toHaveLength(TAMAANO_PILA);
    expect(pila.celdas.every((c) => c === null)).toBe(true);
    expect(pila.cima).toBe(0);
  });
});

describe("meter (PUSH)", () => {
  it("incrementa CIMA y guarda el valor en la posicion de la cima", () => {
    const pila = crearPila();
    const res = meter(pila, 42);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.valor.cima).toBe(1);
    expect(res.valor.celdas[0]).toBe(42);
  });

  it("apila en orden LIFO: el ultimo en entrar queda en la cima", () => {
    const pila = crearPila();
    let actual = pila;
    for (const v of [5, 9, 13]) {
      const res = meter(actual, v);
      expect(res.ok).toBe(true);
      if (res.ok) actual = res.valor;
    }
    expect(actual.cima).toBe(3);
    expect(valorCima(actual)).toBe(13);
    expect(actual.celdas).toEqual([5, 9, 13, null, null, null]);
  });

  it("falla con PILA_LLENA cuando CIMA = TAMAANO", () => {
    let pila = crearPila();
    for (let i = 0; i < TAMAANO_PILA; i++) {
      const res = meter(pila, i + 1);
      expect(res.ok).toBe(true);
      if (res.ok) pila = res.valor;
    }
    expect(estaLlena(pila)).toBe(true);
    const res = meter(pila, 50);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("PILA_LLENA" satisfies ErrorPila);
  });

  it("rechaza valores fuera del rango 1-99 o no enteros", () => {
    const pila = crearPila();
    for (const invalido of [0, 100, -3, 4.5]) {
      const res = meter(pila, invalido);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error).toBe("VALOR_INVALIDO");
    }
  });

  it("no muta la pila original (inmutabilidad)", () => {
    const pila = crearPila();
    meter(pila, 7);
    expect(pila.cima).toBe(0);
    expect(pila.celdas[0]).toBeNull();
  });
});

describe("sacar (POP)", () => {
  it("devuelve el valor de la cima y decrementa CIMA", () => {
    let pila = crearPila();
    const push = meter(pila, 77);
    if (push.ok) pila = push.valor;
    const res = sacar(pila);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.valor.valor).toBe(77);
    expect(res.valor.pila.cima).toBe(0);
    expect(res.valor.pila.celdas[0]).toBeNull();
  });

  it("extrae en orden LIFO", () => {
    let pila = crearPila();
    for (const v of [1, 2, 3]) {
      const r = meter(pila, v);
      if (r.ok) pila = r.valor;
    }
    const primero = sacar(pila);
    expect(primero.ok && primero.valor.valor).toBe(3);
    if (!primero.ok) return;
    const segundo = sacar(primero.valor.pila);
    expect(segundo.ok && segundo.valor.valor).toBe(2);
  });

  it("falla con PILA_VACIA cuando CIMA = 0", () => {
    const res = sacar(crearPila());
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("PILA_VACIA");
  });
});

describe("editarPila", () => {
  it("reemplaza el contenido completo y recalcula CIMA", () => {
    const res = editarPila([3, 8]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.valor.cima).toBe(2);
    expect(res.valor.celdas).toEqual([3, 8, null, null, null, null]);
  });

  it("permite vaciar la pila con una lista vacia", () => {
    const res = editarPila([]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.valor.cima).toBe(0);
  });

  it("falla con CANTIDAD_INVALIDA si excede TAMAANO_PILA", () => {
    const res = editarPila([1, 2, 3, 4, 5, 6, 7]);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("CANTIDAD_INVALIDA");
  });

  it("falla con VALOR_INVALIDO si algun valor no cumple el rango", () => {
    const res = editarPila([1, 0]);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("VALOR_INVALIDO");
  });
});

describe("regresar (deshacer)", () => {
  it("devuelve el estado anterior y consume el historial", () => {
    const pila = crearPila();
    const push = meter(pila, 11);
    if (!push.ok) return;
    const historial = registrarEstado({ estados: [] }, pila);
    const res = regresar(historial);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.valor.pila.cima).toBe(0);
    expect(res.valor.historial.estados).toHaveLength(0);
  });

  it("falla si no hay historial", () => {
    const res = regresar({ estados: [] });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("PILA_VACIA");
  });
});

describe("utilidades", () => {
  it("estaVacia / estaLlena siguen el valor de CIMA", () => {
    const pila = crearPila();
    expect(estaVacia(pila)).toBe(true);
    expect(estaLlena(pila)).toBe(false);
  });

  it("valoresPila devuelve los valores de base a cima", () => {
    let pila = crearPila();
    for (const v of [10, 20]) {
      const r = meter(pila, v);
      if (r.ok) pila = r.valor;
    }
    expect(valoresPila(pila)).toEqual([10, 20]);
  });
});
