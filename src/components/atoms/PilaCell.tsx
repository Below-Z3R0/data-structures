"use client";

import { AnimatePresence, m } from "motion/react";
import type { PilaCellProps } from "../types";

/**
 * Celda del arreglo PILA en la representacion grafica.
 *
 * Muestra la posicion (indice en el arreglo) y el valor almacenado. La
 * celda que apunta CIMA se resalta con el color primario y lleva la
 * flecha.
 *
 * El valor vive dentro de un AnimatePresence: cuando se inserta o se
 * saca, el numero entra o sale con fade + scale en vez de desaparecer de
 * golpe.
 */
export function PilaCell({ index, value, isCima, indiceLabel }: PilaCellProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Flecha que marca la CIMA */}
      <div className="h-6 flex items-end">
        {isCima && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-primary text-lg leading-none"
            aria-hidden="true"
          >
            ▲
          </m.div>
        )}
      </div>

      {/* Celda */}
      <div
        className={`w-full aspect-square max-w-18 min-w-12 rounded-xl border flex items-center justify-center font-mono text-2xl font-bold transition-colors ${
          isCima
            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_24px_rgba(139,92,246,0.35)]"
            : value !== null
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

      {/* Indice */}
      <span className="text-xs font-mono text-muted-foreground">
        {indiceLabel} {index + 1}
      </span>
    </div>
  );
}
