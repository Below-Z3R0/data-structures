"use client";

import { useState } from "react";
import { EstructurasHero } from "@/app/estructuras/components/EstructurasHero";
import { PilaSection } from "@/app/estructuras/components/PilaSection";
import type { EstructuraId } from "@/app/estructuras/services/registro";
import type { EstructurasContainerProps } from "@/app/estructuras/types";
import { SectionReveal } from "@/components/animations/Animations";

/**
 * Container del dominio de estructuras.
 *
 * Es el ancestro comun de la cabecera y de la seccion de la estructura
 * activa: por eso es el dueño del estado `activa`. El menu de estructuras
 * vive en la cabecera y le avisa a este contenedor que estructura se
 * selecciono; el contenedor decide que se renderiza debajo.
 */
export function EstructurasContainer({
  hero,
  pila,
}: EstructurasContainerProps) {
  const [activa, setActiva] = useState<EstructuraId>("pila");

  return (
    <>
      <SectionReveal>
        <EstructurasHero
          data={hero.data}
          estructuras={hero.meta.estructuras}
          activa={activa}
          onSelect={setActiva}
        />
      </SectionReveal>

      <SectionReveal>
        {activa === "pila" ? <PilaSection data={pila} /> : null}
      </SectionReveal>
    </>
  );
}
