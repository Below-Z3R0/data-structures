import { SkeletonPulse } from "./SkeletonPulse";

/**
 * Skeleton de la pagina: replica la estructura del contenido real
 * (cabecera, menu de estructuras, arreglo de la pila y botones) para que
 * la carga no produzca un salto de layout.
 */
export function HomePageSkeleton() {
  return (
    <div className="text-foreground min-h-screen font-display bg-background">
      <main className="flex flex-col gap-20 max-w-241.5 mx-auto px-5 py-60">
        {/* Cabecera */}
        <section className="flex flex-col gap-4">
          <SkeletonPulse className="h-3 w-32" />
          <SkeletonPulse className="h-12 w-96 max-w-full" />
          <SkeletonPulse className="h-9 w-48" />
          <SkeletonPulse className="h-4 w-full max-w-2xl" />
          <SkeletonPulse className="h-4 w-2/3 max-w-2xl" />
        </section>

        {/* Menu de estructuras */}
        <section className="flex gap-3">
          <SkeletonPulse className="h-11 w-28 rounded-xl" />
        </section>

        {/* Panel de la pila */}
        <section className="flex flex-col gap-10">
          <SkeletonPulse className="h-20 w-full max-w-3xl mx-auto rounded-2xl" />
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonPulse key={i} className="size-16 rounded-xl" />
            ))}
          </div>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonPulse key={i} className="h-11 w-32 rounded-xl" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
