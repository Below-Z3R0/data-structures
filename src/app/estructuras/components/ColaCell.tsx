"use client";

import { AnimatePresence, m } from "motion/react";
import type { ColaCellProps } from "@/app/estructuras/types";

/**
 * Celda del arreglo COLA circular en la representacion grafica.
 *
 * Reusa el estilo visual de `PilaCell`: misma celda, mismo AnimatePresence
 * para el valor. La diferencia es que aca una celda puede estar ocupada
 * aunque el valor se haya pintado en otra posicion del arreglo: `ocupada`
 * lo decide el visualizador recorriendo NE posiciones desde FRENTE.
 *
 * Los badges FRENTE / FINAL van arriba de la celda. Cuando FRENTE y FINAL
 * coinciden (un solo elemento) se muestran los dos.
 */
export function ColaCell({
  index,
  value,
  ocupada,
  esFrente,
  esFinal,
  indiceLabel,
  frenteLabel,
  finalLabel,
}: ColaCellProps) {
  const destacada = esFrente || esFinal;
  const marcas = [esFrente ? frenteLabel : null, esFinal ? finalLabel : null]
    .filter(Boolean)
    .join(", ");
  const etiquetaCelda = [
    `${indiceLabel} ${index + 1}`,
    marcas,
    value === null ? "" : `${value}`,
  ]
    .filter((parte) => parte.length > 0)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Badges FRENTE / FINAL: se montan con spring, sin animacion de salida
          (un badge obsoleto mostraria un puntero en la celda equivocada). */}
      <div className="flex min-h-6 flex-wrap items-center justify-center gap-1">
        {esFrente && (
          <m.span
            key="badge-frente"
            aria-hidden="true"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground"
          >
            {frenteLabel}
          </m.span>
        )}
        {esFinal && (
          <m.span
            key="badge-final"
            aria-hidden="true"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-full border border-primary bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
          >
            {finalLabel}
          </m.span>
        )}
      </div>

      {/* Celda */}
      <div
        aria-label={etiquetaCelda}
        role="img"
        className={`w-full aspect-square max-w-18 min-w-12 rounded-xl border flex items-center justify-center font-mono text-2xl font-bold transition-colors ${
          destacada
            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_24px_rgba(139,92,246,0.35)]"
            : ocupada
              ? "bg-card text-foreground border-border"
              : "bg-transparent text-muted-foreground/40 border-border/60 border-dashed"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {value !== null && (
            <m.span
              key={`${index}-${value}`}
              initial={{ opacity: 0, scale: 0.4, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
            >
              {value}
            </m.span>
          )}
        </AnimatePresence>
      </div>

      {/* Indice: posicion absoluta del arreglo circular */}
      <span className="text-xs font-mono text-muted-foreground">
        {indiceLabel} {index + 1}
      </span>
    </div>
  );
}
