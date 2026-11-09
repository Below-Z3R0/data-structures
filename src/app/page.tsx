import { SectionReveal } from "@/components/animations/Animations";
// Los Server Components importan directo del archivo, no del barrel: el
// barrel re-exporta Client Components y Turbopack los resuelve como
// undefined en RSC ("Element type is invalid ... got: undefined").
import { HeroSection } from "@/components/organisms/HeroSection";
import { PilaSection } from "@/components/organisms/PilaSection";
import { getSiteData } from "@/services/data/site";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

/**
 * Orquestador de la home.
 *
 * Unico lugar que pide datos: despues pasa props tipadas a cada organism.
 * Ningun componente consulta la fuente de datos por su cuenta.
 */
export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentLang = resolvedParams.lang || "es";

  const { content, metadata } = await getSiteData(currentLang);

  const hero_data = {
    data: content["section.hero"],
    meta: metadata["section.hero"],
  };
  const pila_data = {
    labels: content["section.pila"].labels,
    buttons: content["section.pila"].buttons,
    modal: content["section.pila"].modal,
    errors: content["section.pila"].errors,
  };

  return (
    <main
      id="main-content"
      className="flex flex-col gap-20 max-w-241.5 mx-auto px-5 pb-40"
    >
      <SectionReveal>
        <HeroSection hero_data={hero_data} />
      </SectionReveal>

      <SectionReveal>
        <PilaSection data={pila_data} />
      </SectionReveal>
    </main>
  );
}
