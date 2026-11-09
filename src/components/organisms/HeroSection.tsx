// Client Components: se importan directo del archivo, no del barrel, para
// evitar el bug de Turbopack con barrels que mezclan client y server.
import { Button } from "../atoms/Button";
import { LanguageSwitcher } from "../atoms/LanguageSwitcher";
import { ThemeSwitcher } from "../atoms/ThemeSwitcher";
import { Title1 } from "../atoms/Title1";
import { Title2 } from "../atoms/Title2";
import type { HeroSectionProps } from "../types";

/**
 * Cabecera de la pagina.
 *
 * En el lugar donde estaria el titulo principal va el menu de estructuras
 * de datos: botones en linea, uno al lado del otro, que cambian que se
 * renderiza debajo.
 */
export function HeroSection({ hero_data }: HeroSectionProps) {
  const { data, meta } = hero_data;

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
        <nav
          aria-label="Estructuras de datos"
          className="flex flex-wrap items-center gap-3"
        >
          {meta.estructuras.map((estructura) => (
            <Button
              key={estructura.id}
              txt={estructura.label}
              title={estructura.description}
              aria-current="true"
              buttonBody="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              txtStyle="text-primary-foreground!"
            />
          ))}
        </nav>
      </div>
    </section>
  );
}
