"use client";

import { EstructuraMenu } from "@/app/estructuras/components/EstructuraMenu";
import type { EstructurasHeroProps } from "@/app/estructuras/types";
import { LanguageSwitcher } from "@/components/atoms/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/atoms/ThemeSwitcher";
import { Title1 } from "@/components/atoms/Title1";
import { Title2 } from "@/components/atoms/Title2";

/**
 * Cabecera de la pagina.
 *
 * En el lugar donde estaria el titulo principal va el menu de estructuras
 * de datos: botones en linea, uno al lado del otro, que cambian que se
 * renderiza debajo.
 */
export function EstructurasHero({
  data,
  estructuras,
  menuLabel,
  activa,
  onSelect,
}: EstructurasHeroProps) {
  return (
    <section id="Home" className="pt-10">
      <div className="flex flex-col gap-8">
        {/* Controles: idioma, paleta */}
        <div className="flex items-center justify-end gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        {/* Titulos */}
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">
            {data.eyebrow}
          </span>
          <Title1 txt={data.title} />
          <Title2 txt={data.subtitle} />
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-left">
            {data.paragraph}
          </p>
        </div>

        {/* Menu de estructuras de datos */}
        <EstructuraMenu
          estructuras={estructuras}
          menuLabel={menuLabel}
          activa={activa}
          onSelect={onSelect}
        />
      </div>
    </section>
  );
}
