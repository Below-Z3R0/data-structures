"use client";

import { ColaVisualizer } from "@/app/estructuras/components/ColaVisualizer";
import { colaAdapter } from "@/app/estructuras/components/colaAdapter";
import { EstructuraSection } from "@/app/estructuras/components/EstructuraSection";
import type { ColaViewData } from "@/app/estructuras/types";

// Organismo de la COLA: el generico con su adaptador y su visualizador.
export function ColaSection({ data }: { data: ColaViewData }) {
  return (
    <EstructuraSection
      data={data}
      adapter={colaAdapter}
      visualizer={(cola) => <ColaVisualizer cola={cola} labels={data.labels} />}
    />
  );
}
