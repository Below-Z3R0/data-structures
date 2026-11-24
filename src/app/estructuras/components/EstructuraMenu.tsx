"use client";

import type { EstructuraMenuProps } from "@/app/estructuras/types";
import { Button } from "@/components/atoms/Button";

/**
 * Menu de estructuras de datos.
 *
 * Un boton por estructura. La activa se resalta con el color primario;
 * las demas quedan en el estilo secundario. Al hacer click se avisa al
 * contenedor, que es el dueño del estado de la estructura seleccionada.
 */
export function EstructuraMenu({
  estructuras,
  activa,
  onSelect,
}: EstructuraMenuProps) {
  return (
    <nav
      aria-label="Estructuras de datos"
      className="flex flex-wrap items-center gap-3"
    >
      {estructuras.map((estructura) => {
        const esActiva = estructura.id === activa;

        return (
          <Button
            key={estructura.id}
            type="button"
            txt={estructura.label}
            title={estructura.description}
            onClick={() => onSelect(estructura.id)}
            aria-pressed={esActiva}
            buttonBody={
              esActiva
                ? "h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                : "h-11 px-6 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-hover hover:border-destructive active:scale-95 transition-all"
            }
            txtStyle={esActiva ? "text-primary-foreground!" : undefined}
          />
        );
      })}
    </nav>
  );
}
