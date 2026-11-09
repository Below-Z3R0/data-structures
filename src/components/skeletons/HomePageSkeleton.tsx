import {
  FormularySkeleton,
  NavBarSkeleton,
  ProjectCardSkeleton,
  TecnologiesCardSkeleton,
} from "./skeletonindex"; // Asegúrate de exportarlos desde donde los guardaste

const SkeletonPulse = ({ className }: { className?: string }) => (
  <div className={`bg-muted animate-pulse rounded-xl ${className}`} />
);

export function HomePageSkeleton() {
  return (
    <div className="text-foreground min-h-screen font-display bg-background">
      {/* 1. NavBar Skeleton */}
      <NavBarSkeleton />

      {/* 2. Hero Section Skeleton */}
      <section className="py-50 max-w-241.5 mx-auto px-5">
        <div className="gap-4 flex flex-col justify-start items-start h-full">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="rounded-full size-20 border border-border border border-border" />
            <SkeletonPulse className="w-48 h-8 rounded-full" />
          </div>
          <SkeletonPulse className="w-full max-w-2xl h-16 mb-5" />{" "}
          {/* Title1 */}
          <div className="space-y-3 w-full max-w-2xl">
            <SkeletonPulse className="w-full h-4" /> {/* Paragraph 1 */}
            <SkeletonPulse className="w-11/12 h-4" />
            <SkeletonPulse className="w-full h-4 mt-4" /> {/* Paragraph 2 */}
            <SkeletonPulse className="w-9/12 h-4" />
          </div>
          <nav className="flex gap-4 mt-8">
            <SkeletonPulse className="w-36 h-11 rounded-xl" />
            <SkeletonPulse className="w-36 h-11 rounded-xl" />
          </nav>
        </div>
      </section>

      {/* 3. Tecnologies Skeleton */}
      <section className="flex flex-col gap-8 max-w-241.5 mx-auto py-20 px-5">
        <div className="flex items-start flex-col gap-4">
          <SkeletonPulse className="w-32 h-4" />
          <SkeletonPulse className="w-64 h-10" />
          <SkeletonPulse className="w-full max-w-md h-4" />
        </div>

        {["Frontend", "Backend", "DevOps"].map((cat) => (
          <div key={cat} className="flex flex-col items-start gap-6 w-full">
            <SkeletonPulse className="w-24 h-6 ml-4" />
            <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
              {[1, 2, 3, 4].map((i) => (
                <TecnologiesCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 4. Projectos Skeleton */}
      <section className="flex flex-col py-25 gap-10 max-w-241.5 mx-auto px-5">
        <div className="flex items-start flex-col gap-4">
          <SkeletonPulse className="w-32 h-4" />
          <SkeletonPulse className="w-64 h-10" />
          <SkeletonPulse className="w-full max-w-md h-4" />
        </div>
        <div className="w-full flex flex-wrap gap-8">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      </section>

      {/* 5. About Me Skeleton */}
      <section className="section flex lg:flex-nowrap lg:flex-row flex-col-reverse max-w-241.5 mx-auto py-32 px-5 gap-10">
        <div className="w-full flex items-start flex-col gap-4">
          <SkeletonPulse className="w-32 h-4" />
          <SkeletonPulse className="w-64 h-10" />
          <div className="space-y-4 w-full">
            <SkeletonPulse className="w-full h-4" />
            <SkeletonPulse className="w-full h-4" />
            <SkeletonPulse className="w-4/5 h-4" />
          </div>
        </div>
        <SkeletonPulse className="size-60 rounded-2xl shrink-0 mx-auto" />
      </section>

      {/* 6. Contact Section Skeleton */}
      <section className="section flex flex-col gap-4 max-w-241.5 mx-auto py-20 px-5">
        <div className="rounded-3xl flex qw:flex-row flex-col qw:justify-between gap-10 p-12 bg-card border border-border border border-border">
          <div className="qw:w-[50%] w-full flex flex-col gap-6">
            <div className="space-y-4">
              <SkeletonPulse className="w-32 h-4" />
              <SkeletonPulse className="w-64 h-10" />
              <SkeletonPulse className="w-full h-12" />
            </div>
            <div className="flex flex-wrap gap-4">
              <SkeletonPulse className="w-32 h-12 rounded-xl" />
              <SkeletonPulse className="w-32 h-12 rounded-xl" />
            </div>
          </div>
          <div className="qw:w-[45%] w-full">
            <FormularySkeleton />
          </div>
        </div>
      </section>

      {/* 7. Footer Skeleton */}
      <footer className="py-20 flex flex-col items-center gap-8 max-w-241.5 mx-auto border-t border/50 mt-20">
        <div className="flex gap-8">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonPulse key={i} className="w-16 h-4" />
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <SkeletonPulse className="w-48 h-4" />
          <SkeletonPulse className="w-64 h-3" />
        </div>
      </footer>
    </div>
  );
}
