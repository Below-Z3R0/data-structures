import type { EstructuraAdapter } from "@/app/estructuras/components/EstructuraSection";
import {
  crearPila,
  editarPila,
  type HistorialPila,
  meter,
  type Pila,
  registrarEstado,
  regresar,
  sacar,
  valoresPila,
} from "@/app/estructuras/services/pila";

// Adaptador de la PILA: cambia la forma del retorno, no la logica.
export const pilaAdapter: EstructuraAdapter<Pila, HistorialPila> = {
  crear: crearPila,
  historialVacio: () => ({ estados: [] }),
  valores: valoresPila,
  insertar: (pila, valor) => {
    const r = meter(pila, valor);
    return r.ok
      ? { ok: true, valor: { estado: r.valor } }
      : { ok: false, error: r.error };
  },
  eliminar: (pila) => {
    const r = sacar(pila);
    return r.ok
      ? { ok: true, valor: { estado: r.valor.pila, item: r.valor.valor } }
      : { ok: false, error: r.error };
  },
  editar: (valores) => {
    const r = editarPila(valores);
    return r.ok
      ? { ok: true, valor: { estado: r.valor } }
      : { ok: false, error: r.error };
  },
  regresar: (historial) => {
    const r = regresar(historial);
    return r.ok
      ? {
          ok: true,
          valor: { estado: r.valor.pila },
          historial: r.valor.historial,
        }
      : { ok: false, error: r.error };
  },
  registrar: registrarEstado,
  idPrefix: "pila",
};
