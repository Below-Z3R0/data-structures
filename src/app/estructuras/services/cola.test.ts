import { describe, expect, it } from "vitest";
import {
  type Cola,
  crearCola,
  type ErrorCola,
  editarCola,
  eliminar,
  espaciosLibres,
  estaLlena,
  estaVacia,
  insertar,
  numeroElementos,
  registrarEstado,
  regresar,
  TAMAANO_COLA,
  valoresCola,
  valorFinal,
  valorFrente,
} from "./cola";

/** Arma una cola desde cero usando la operacion de edicion. */
function armar(valores: number[]): Cola {
  const res = editarCola(valores);
  if (!res.ok) throw new Error(`no se pudo armar la cola: ${res.error}`);
  return res.valor;
}

/** Inserta varios valores en orden, uno detras del otro. */
function insertarVarios(cola: Cola, valores: number[]): Cola {
  let actual = cola;
  for (const v of valores) {
    const res = insertar(actual, v);
    if (!res.ok) throw new Error(`no se pudo insertar ${v}: ${res.error}`);
    actual = res.valor;
  }
  return actual;
}

/** Elimina n elementos y devuelve los items extraidos con la cola resultante. */
function eliminarVarios(
  cola: Cola,
  n: number,
): { cola: Cola; items: number[] } {
  let actual = cola;
  const items: number[] = [];
  for (let i = 0; i < n; i++) {
    const res = eliminar(actual);
    if (!res.ok) throw new Error(`no se pudo eliminar: ${res.error}`);
    items.push(res.valor.item);
    actual = res.valor.cola;
  }
  return { cola: actual, items };
}

describe("crearCola", () => {
  it("arranca vacia: FRENTE = FINAL = 0 y 6 celdas en null", () => {
    const cola = crearCola();
    expect(cola.celdas).toHaveLength(TAMAANO_COLA);
    expect(cola.celdas.every((c) => c === null)).toBe(true);
    expect(cola.frente).toBe(0);
    expect(cola.final).toBe(0);
    expect(estaVacia(cola)).toBe(true);
  });
});

describe("insertar (INSERCOLA)", () => {
  it("el primer elemento deja FRENTE = FINAL = 1 y guarda en la celda 1", () => {
    const res = insertar(crearCola(), 42);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.valor.frente).toBe(1);
    expect(res.valor.final).toBe(1);
    expect(res.valor.celdas[0]).toBe(42);
    expect(numeroElementos(res.valor)).toBe(1);
  });

  it("el segundo elemento mueve FINAL a 2 y deja FRENTE en 1", () => {
    const cola = insertarVarios(crearCola(), [10, 20]);
    expect(cola.frente).toBe(1);
    expect(cola.final).toBe(2);
    expect(cola.celdas).toEqual([10, 20, null, null, null, null]);
  });

  it("se llena con 6 elementos (FRENTE = 1, FINAL = MAX) y el 7 falla con COLA_LLENA", () => {
    const cola = insertarVarios(crearCola(), [1, 2, 3, 4, 5, 6]);
    expect(cola.frente).toBe(1);
    expect(cola.final).toBe(TAMAANO_COLA);
    expect(estaLlena(cola)).toBe(true);

    const res = insertar(cola, 50);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("COLA_LLENA" satisfies ErrorCola);
  });

  it("WRAP DE FINAL: con FINAL = MAX y lugar libre, el insert reinicia FINAL = 1", () => {
    // llena el arreglo (FRENTE 1, FINAL 6) y libera el frente.
    const llena = armar([1, 2, 3, 4, 5, 6]);
    const trasSacar = eliminar(llena);
    if (!trasSacar.ok) return;
    expect(trasSacar.valor.cola.frente).toBe(2);
    expect(trasSacar.valor.cola.final).toBe(6);

    const res = insertar(trasSacar.valor.cola, 7);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // el corte se cruzo de verdad: FINAL retrocede a 1 y escribe la celda 1.
    expect(res.valor.final).toBe(1);
    expect(res.valor.frente).toBe(2);
    expect(res.valor.celdas[0]).toBe(7);
    expect(numeroElementos(res.valor)).toBe(TAMAANO_COLA);
    expect(valoresCola(res.valor)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it("rechaza valores fuera del rango 1-99 o no enteros", () => {
    const cola = crearCola();
    for (const invalido of [0, 100, -3, 4.5]) {
      const res = insertar(cola, invalido);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error).toBe("VALOR_INVALIDO" satisfies ErrorCola);
    }
  });

  it("no muta la cola original (inmutabilidad)", () => {
    const cola = crearCola();
    const res = insertar(cola, 7);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(cola.frente).toBe(0);
    expect(cola.final).toBe(0);
    expect(cola.celdas[0]).toBeNull();
    expect(res.valor.celdas).not.toBe(cola.celdas);
  });
});

describe("eliminar (ELIMCOLA)", () => {
  it("saca el valor del FRENTE (FIFO) y avanza FRENTE", () => {
    const cola = armar([1, 2, 3]);
    const res = eliminar(cola);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.valor.item).toBe(1);
    expect(res.valor.cola.frente).toBe(2);
    expect(res.valor.cola.final).toBe(3);
    expect(res.valor.cola.celdas[0]).toBeNull();
    expect(valoresCola(res.valor.cola)).toEqual([2, 3]);
  });

  it("respeta el orden FIFO: de [1,2,3] sale 1 y despues 2", () => {
    const primero = eliminar(armar([1, 2, 3]));
    if (!primero.ok) return;
    expect(primero.valor.item).toBe(1);

    const segundo = eliminar(primero.valor.cola);
    if (!segundo.ok) return;
    expect(segundo.valor.item).toBe(2);
  });

  it("al sacar el unico elemento deja FRENTE = FINAL = 0 y la cola vacia", () => {
    const res = eliminar(armar([9]));
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.valor.item).toBe(9);
    expect(res.valor.cola.frente).toBe(0);
    expect(res.valor.cola.final).toBe(0);
    expect(valoresCola(res.valor.cola)).toEqual([]);
    expect(estaVacia(res.valor.cola)).toBe(true);
  });

  it("falla con COLA_VACIA al eliminar de una cola vacia", () => {
    const res = eliminar(crearCola());
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("COLA_VACIA" satisfies ErrorCola);
  });

  it("WRAP DE FRENTE: con FRENTE = MAX el siguiente avanza a 1", () => {
    // arma un estado real con FRENTE en MAX y FINAL cruzado: [60, 70].
    const cola = armar([10, 20, 30, 40, 50, 60]);
    const conVuelta = insertarVarios(eliminarVarios(cola, 1).cola, [70]);
    const parcial = eliminarVarios(conVuelta, 4).cola;

    // aca FRENTE = 6 = MAX y FINAL = 1: el escenario cruza el corte.
    expect(parcial.frente).toBe(TAMAANO_COLA);
    expect(parcial.final).toBe(1);
    expect(valoresCola(parcial)).toEqual([60, 70]);

    const res = eliminar(parcial);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.valor.item).toBe(60);
    expect(res.valor.cola.frente).toBe(1);
    expect(res.valor.cola.final).toBe(1);
    expect(valoresCola(res.valor.cola)).toEqual([70]);
  });
});

describe("estaLlena / numeroElementos / espaciosLibres", () => {
  it("estaLlena es verdadero con FRENTE = 1 y FINAL = MAX", () => {
    const cola = armar([1, 2, 3, 4, 5, 6]);
    expect(cola.frente).toBe(1);
    expect(cola.final).toBe(TAMAANO_COLA);
    expect(estaLlena(cola)).toBe(true);
  });

  it("estaLlena es verdadero con FRENTE = FINAL + 1", () => {
    // llega a FRENTE = 3 y FINAL = 2 (lleno con el corte en el medio).
    const base = eliminarVarios(armar([1, 2, 3, 4, 5]), 2).cola;
    const cola = insertarVarios(base, [6, 7, 8]);

    expect(cola.frente).toBe(3);
    expect(cola.final).toBe(2);
    expect(cola.frente).toBe(cola.final + 1);
    expect(estaLlena(cola)).toBe(true);
    expect(numeroElementos(cola)).toBe(TAMAANO_COLA);
    expect(valoresCola(cola)).toEqual([3, 4, 5, 6, 7, 8]);

    const res = insertar(cola, 9);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("COLA_LLENA" satisfies ErrorCola);
  });

  it("NE con FRENTE <= FINAL (sin vuelta)", () => {
    const cola = armar([1, 2, 3]);
    expect(cola.frente).toBe(1);
    expect(cola.final).toBe(3);
    expect(numeroElementos(cola)).toBe(3);
    expect(numeroElementos(crearCola())).toBe(0);
  });

  it("NE con FRENTE > FINAL (con vuelta) aplica MAX + (FINAL - FRENTE + 1)", () => {
    // [5, 6] con FRENTE 5 y FINAL 6, mas 7 y 8 que dan la vuelta al 1 y 2.
    const base = eliminarVarios(armar([1, 2, 3, 4, 5, 6]), 4).cola;
    const cola = insertarVarios(base, [7, 8]);

    expect(cola.frente).toBe(5);
    expect(cola.final).toBe(2);
    // sin la rama con vuelta la resta daria -2; la formula correcta da 4.
    expect(TAMAANO_COLA + (cola.final - cola.frente + 1)).toBe(4);
    expect(numeroElementos(cola)).toBe(4);
    expect(valoresCola(cola)).toEqual([5, 6, 7, 8]);
  });

  it("EL = MAX - NE en vacia, a medias y llena", () => {
    expect(espaciosLibres(crearCola())).toBe(TAMAANO_COLA);
    expect(espaciosLibres(armar([1, 2, 3]))).toBe(3);
    expect(espaciosLibres(armar([1, 2, 3, 4, 5, 6]))).toBe(0);

    // tambien con vuelta: 4 elementos ocupan 4 celdas del circulo.
    const base = eliminarVarios(armar([1, 2, 3, 4, 5, 6]), 4).cola;
    const cola = insertarVarios(base, [7, 8]);
    expect(espaciosLibres(cola)).toBe(2);
  });
});

describe("valorFrente / valorFinal", () => {
  it("devuelven null en una cola vacia", () => {
    const cola = crearCola();
    expect(valorFrente(cola)).toBeNull();
    expect(valorFinal(cola)).toBeNull();
  });

  it("devuelven los valores correctos con la cola a medias", () => {
    const cola = armar([4, 5, 6]);
    expect(valorFrente(cola)).toBe(4);
    expect(valorFinal(cola)).toBe(6);
  });

  it("devuelven los extremos correctos cuando la cola da la vuelta", () => {
    const base = eliminarVarios(armar([1, 2, 3, 4, 5, 6]), 4).cola;
    const cola = insertarVarios(base, [7, 8]);

    expect(cola.frente).toBe(5);
    expect(cola.final).toBe(2);
    expect(valorFrente(cola)).toBe(5);
    expect(valorFinal(cola)).toBe(8);
  });
});

describe("valoresCola", () => {
  it("sin vuelta devuelve el orden de insercion", () => {
    expect(valoresCola(armar([7, 8, 9]))).toEqual([7, 8, 9]);
    expect(valoresCola(insertarVarios(crearCola(), [4, 2, 6]))).toEqual([
      4, 2, 6,
    ]);
  });

  it("con vuelta devuelve el orden correcto cruzando el corte", () => {
    // 6 inserts, 3 eliminaciones y 2 inserts mas: FINAL queda antes que FRENTE.
    const cola = insertarVarios(
      eliminarVarios(armar([1, 2, 3, 4, 5, 6]), 3).cola,
      [7, 8],
    );

    expect(cola.frente).toBe(4);
    expect(cola.final).toBe(2);
    expect(cola.celdas).toEqual([7, 8, null, 4, 5, 6]);
    expect(valoresCola(cola)).toEqual([4, 5, 6, 7, 8]);
    expect(valoresCola(cola)).toHaveLength(numeroElementos(cola));
  });
});

describe("editarCola", () => {
  it("reemplaza el contenido y recalcula FRENTE = 1, FINAL = n", () => {
    const res = editarCola([3, 8]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.valor.frente).toBe(1);
    expect(res.valor.final).toBe(2);
    expect(res.valor.celdas).toEqual([3, 8, null, null, null, null]);
  });

  it("una lista vacia deja FRENTE = FINAL = 0 (no es error)", () => {
    const res = editarCola([]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.valor.frente).toBe(0);
    expect(res.valor.final).toBe(0);
    expect(estaVacia(res.valor)).toBe(true);
  });

  it("falla con CANTIDAD_INVALIDA si excede TAMAANO_COLA", () => {
    const res = editarCola([1, 2, 3, 4, 5, 6, 7]);
    expect(res.ok).toBe(false);
    if (!res.ok)
      expect(res.error).toBe("CANTIDAD_INVALIDA" satisfies ErrorCola);
  });

  it("falla con VALOR_INVALIDO si algun valor no cumple el rango", () => {
    const res = editarCola([1, 0]);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("VALOR_INVALIDO" satisfies ErrorCola);
  });
});

describe("regresar (deshacer)", () => {
  it("devuelve el estado anterior y consume el historial", () => {
    const vacia = crearCola();
    const conUno = insertarVarios(vacia, [11]);
    const historial = registrarEstado({ estados: [] }, vacia);

    const res = regresar(historial);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.valor.cola).toEqual(vacia);
    expect(res.valor.cola).not.toEqual(conUno);
    expect(res.valor.historial.estados).toHaveLength(0);
  });

  it("falla con sin_historial si el historial esta vacio", () => {
    const res = regresar({ estados: [] });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("sin_historial" satisfies ErrorCola);
  });
});
