"use client";

import { useState } from "react";
import { ColaSection } from "@/app/estructuras/components/ColaSection";
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
  cola,
}: EstructurasContainerProps) {
  const [activa, setActiva] = useState<EstructuraId>(
    hero.meta.estructuras[0]?.id ?? "pila",
  );

  return (
    <>
      <SectionReveal>
        <EstructurasHero
          data={hero.data}
          estructuras={hero.meta.estructuras}
          menuLabel={hero.meta.menu_label}
          activa={activa}
          onSelect={setActiva}
        />
      </SectionReveal>

      <SectionReveal>
        {hero.meta.estructuras.map((estructura) => (
          <div key={estructura.id} hidden={estructura.id !== activa}>
            {estructura.id === "pila" ? (
              <PilaSection data={pila} />
            ) : estructura.id === "cola" ? (
              <ColaSection data={cola} />
            ) : null}
          </div>
        ))}
      </SectionReveal>
    </>
  );
}
