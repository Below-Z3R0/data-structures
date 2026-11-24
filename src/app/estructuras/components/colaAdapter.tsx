import type { EstructuraAdapter } from "@/app/estructuras/components/EstructuraSection";
import {
  type Cola,
  crearCola,
  editarCola,
  eliminar,
  type HistorialCola,
  insertar,
  registrarEstado,
  regresar,
  valoresCola,
} from "@/app/estructuras/services/cola";

// Adaptador de la COLA: cambia la forma del retorno, no la logica.
export const colaAdapter: EstructuraAdapter<Cola, HistorialCola> = {
  crear: crearCola,
  historialVacio: () => ({ estados: [] }),
  valores: valoresCola,
  insertar: (cola, valor) => {
    const r = insertar(cola, valor);
    return r.ok
      ? { ok: true, valor: { estado: r.valor } }
      : { ok: false, error: r.error };
  },
  eliminar: (cola) => {
    const r = eliminar(cola);
    return r.ok
      ? { ok: true, valor: { estado: r.valor.cola, item: r.valor.item } }
      : { ok: false, error: r.error };
  },
  editar: (valores) => {
    const r = editarCola(valores);
    return r.ok
      ? { ok: true, valor: { estado: r.valor } }
      : { ok: false, error: r.error };
  },
  regresar: (historial) => {
    const r = regresar(historial);
    return r.ok
      ? {
          ok: true,
          valor: { estado: r.valor.cola },
          historial: r.valor.historial,
        }
      : { ok: false, error: r.error };
  },
  registrar: registrarEstado,
  idPrefix: "cola",
};
