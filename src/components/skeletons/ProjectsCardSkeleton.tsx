import { SkeletonPulse } from "./SkeletonPulse";

export function ProjectCardSkeleton() {
  return (
    <div className="qw:h-100 w-full min-h-100 rounded-xl flex qw:flex-row flex-col-reverse justify-between p-5 bg-card border border-border shadow-lg">
      {/* Contenido Izquierdo/Inferior */}
      <div className="qw:w-[50%] h-full w-full flex flex-col mt-3 qw:mt-0 items-start gap-3">
        <SkeletonPulse className="w-40 h-10 rounded-xl" />{" "}
        {/* Badge destacado */}
        <SkeletonPulse className="w-3/4 h-8 mt-1" /> {/* Título */}
        <div className="w-full flex-1 space-y-2">
          {" "}
          {/* Párrafo */}
          <SkeletonPulse className="w-full h-4" />
          <SkeletonPulse className="w-full h-4" />
          <SkeletonPulse className="w-2/3 h-4" />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-2">
            <SkeletonPulse className="w-20 h-8" />
            <SkeletonPulse className="w-20 h-8" />
          </div>
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <SkeletonPulse key={i} className="size-6" />
              ))}
            </div>
            <SkeletonPulse className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Imagen Derecha/Superior */}
      <SkeletonPulse className="qw:w-[47.9%] qw:h-full h-48 rounded-xl" />
    </div>
  );
}
