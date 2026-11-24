"use client";

import { EstructuraSection } from "@/app/estructuras/components/EstructuraSection";
import { PilaVisualizer } from "@/app/estructuras/components/PilaVisualizer";
import { pilaAdapter } from "@/app/estructuras/components/pilaAdapter";
import type { PilaViewData } from "@/app/estructuras/types";

// Organismo de la PILA: el generico con su adaptador y su visualizador.
export function PilaSection({ data }: { data: PilaViewData }) {
  return (
    <EstructuraSection
      data={data}
      adapter={pilaAdapter}
      visualizer={(pila) => <PilaVisualizer pila={pila} labels={data.labels} />}
    />
  );
}
