import { SkeletonPulse } from "./SkeletonPulse";

export function FormularySkeleton() {
  return (
    <div className="rounded-3xl size-full flex flex-col p-[5%] bg-card border border-border shadow-2xl space-y-6">
      <SkeletonPulse className="w-1/2 h-8 mb-2" />

      {/* Inputs superiores */}
      <div className="w-full space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="w-24 h-4" />
            <SkeletonPulse className="w-full h-11 rounded-md" />
          </div>
        ))}
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <SkeletonPulse className="w-24 h-4" />
        <SkeletonPulse className="w-full h-40 rounded-xl" />
      </div>

      <SkeletonPulse className="w-7/12 h-12 rounded-md" />
    </div>
  );
}
