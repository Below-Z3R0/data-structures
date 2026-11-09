import { SkeletonPulse } from "./SkeletonPulse";

export function TecnologiesCardSkeleton() {
  return (
    <div className="w-32 h-32 flex flex-col items-center justify-center p-4 bg-popover backdrop-blur-sm border border-border rounded-3xl">
      <SkeletonPulse className="size-12 rounded-2xl mb-3" />
      <SkeletonPulse className="w-16 h-3" />
    </div>
  );
}
