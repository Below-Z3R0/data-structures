import {
  estaLlena,
  estaVacia,
  type Pila,
  TAMAANO_PILA,
} from "@/services/data-structures/pila";
// PilaCell es un Client Component: se importa directo del archivo, no del
// barrel (bug de Turbopack con barrels que mezclan client y server).
import { PilaCell } from "../atoms/PilaCell";
import type { PilaLabels } from "../types";

/**
 * Identidad estable de cada celda del arreglo.
 *
 * La posicion en memoria no se reordena nunca: por eso el id puede
 * derivarse del indice. Se precomputa para que el key del render no
 * dependa del index del map.
 */
const CELDA_IDS = Array.from(
  { length: TAMAANO_PILA },
  (_, index) => `celda-${index}`,
);

/**
 * Representacion grafica del arreglo PILA.
 *
 * Muestra las TAMAANO celdas en fila, la flecha que marca la CIMA y un
 * panel de estado con el valor de CIMA, TAMAANO y la condicion actual
 * (vacia / llena).
 */
export function PilaVisualizer({
  pila,
  labels,
}: {
  pila: Pila;
  labels: PilaLabels;
}) {
  const vacia = estaVacia(pila);
  const llena = estaLlena(pila);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Panel de estado: CIMA, TAMAÑO y condicion */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-border bg-card/60 px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {labels.cima}
          </span>
          <span className="font-mono text-2xl font-bold text-primary">
            {pila.cima}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {labels.tamano}
          </span>
          <span className="font-mono text-2xl font-bold text-foreground">
            {pila.celdas.length}
          </span>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            vacia
              ? "border-warning/40 bg-warning-soft text-warning"
              : llena
                ? "border-destructive/40 bg-destructive-soft text-destructive"
                : "border-success/40 bg-success-soft text-success"
          }`}
        >
          {vacia ? labels.vacia : llena ? labels.llena : `${pila.cima}`}
        </span>
      </div>

      {/* Arreglo PILA */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full max-w-3xl items-start justify-center gap-2 sm:gap-4">
          {pila.celdas.map((valor, index) => (
            <PilaCell
              key={CELDA_IDS[index]}
              index={index}
              value={valor}
              isCima={index === pila.cima - 1}
              indiceLabel={labels.indice}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
