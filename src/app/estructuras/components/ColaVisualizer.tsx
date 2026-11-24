import { ColaCell } from "@/app/estructuras/components/ColaCell";
import {
  type Cola,
  espaciosLibres,
  estaLlena,
  estaVacia,
  numeroElementos,
  TAMAANO_COLA,
} from "@/app/estructuras/services/cola";
import type { ColaLabels } from "@/app/estructuras/types";

/**
 * Identidad estable de cada celda del arreglo circular.
 * La posicion en memoria no se reordena nunca: el id se deriva del indice.
 */
const CELDA_IDS = Array.from(
  { length: TAMAANO_COLA },
  (_, index) => `celda-cola-${index}`,
);

/**
 * Representacion grafica del arreglo COLA circular.
 *
 * Muestra las MAX celdas en fila con su indice absoluto, los badges de
 * FRENTE y FINAL sobre la celda que les corresponde y un panel de estado
 * siempre visible con FRENTE, FINAL, MAX, ELEMENTOS (NE) y LIBRES (EL).
 *
 * Las posiciones ocupadas NO se derivan de `value !== null`: como la cola
 * da la vuelta, el tramo util puede cruzar el corte del arreglo. Se
 * calculan recorriendo NE posiciones desde FRENTE, igual que `valoresCola`.
 */
export function ColaVisualizer({
  cola,
  labels,
}: {
  cola: Cola;
  labels: ColaLabels;
}) {
  const vacia = estaVacia(cola);
  const llena = estaLlena(cola);
  const elementos = numeroElementos(cola);
  const libres = espaciosLibres(cola);

  // Posiciones ocupadas (base 1), recorriendo NE posiciones desde FRENTE.
  const ocupadas = new Set<number>();
  if (!vacia) {
    let posicion = cola.frente;
    for (let i = 0; i < elementos; i++) {
      ocupadas.add(posicion);
      posicion = posicion === TAMAANO_COLA ? 1 : posicion + 1;
    }
  }

  const datos = [
    { clave: "frente", label: labels.frente, valor: cola.frente, acento: true },
    { clave: "final", label: labels.final, valor: cola.final, acento: true },
    { clave: "max", label: labels.max, valor: TAMAANO_COLA, acento: false },
    {
      clave: "elementos",
      label: labels.elementos,
      valor: elementos,
      acento: false,
    },
    { clave: "libres", label: labels.libres, valor: libres, acento: false },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Panel de estado: FRENTE, FINAL, MAX, ELEMENTOS y LIBRES */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-border bg-card/60 px-6 py-4">
        {datos.map((dato) => (
          <div key={dato.clave} className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {dato.label}
            </span>
            <span
              className={`font-mono text-2xl font-bold ${
                dato.acento ? "text-primary" : "text-foreground"
              }`}
            >
              {dato.valor}
            </span>
          </div>
        ))}

        {(vacia || llena) && (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              vacia
                ? "border-warning/40 bg-warning-soft text-warning"
                : "border-destructive/40 bg-destructive-soft text-destructive"
            }`}
          >
            {vacia ? labels.vacia : labels.llena}
          </span>
        )}
      </div>

      {/* Arreglo COLA */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full max-w-3xl items-start justify-center gap-2 sm:gap-4">
          {cola.celdas.map((valor, index) => {
            const posicion = index + 1;
            return (
              <ColaCell
                key={CELDA_IDS[index]}
                index={index}
                value={valor}
                ocupada={ocupadas.has(posicion)}
                esFrente={!vacia && posicion === cola.frente}
                esFinal={!vacia && posicion === cola.final}
                indiceLabel={labels.indice}
                frenteLabel={labels.frente}
                finalLabel={labels.final}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
