// Los Server Components importan directo del archivo, no del barrel: el
// barrel re-exporta Client Components y Turbopack los resuelve como
// undefined en RSC ("Element type is invalid ... got: undefined").
import { EstructurasContainer } from "@/app/estructuras/containers/EstructurasContainer";
import { getSiteData } from "@/services/data/site";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

/**
 * Orquestador de la home.
 *
 * Unico lugar que pide datos: despues pasa props tipadas al container del
 * dominio de estructuras. Ningun componente consulta la fuente de datos
 * por su cuenta.
 */
export default async function Home({ searchParams }: PageProps) {
  const resolved = await searchParams;

  const { content, metadata } = await getSiteData(resolved.lang || "es");

  return (
    <main
      id="main-content"
      className="flex flex-col gap-20 max-w-241.5 mx-auto px-5 pb-40"
    >
      <EstructurasContainer
        hero={{
          data: content["section.hero"],
          meta: metadata["section.hero"],
        }}
        pila={content["section.pila"]}
        cola={content["section.cola"]}
      />
    </main>
  );
}
