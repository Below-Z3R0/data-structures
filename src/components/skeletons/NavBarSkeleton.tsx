import { SkeletonPulse } from "./SkeletonPulse";

export function NavBarSkeleton() {
  return (
    <nav className="z-20 qw:left-5 qw:right-5 left-2 right-2 max-w-241.5 h-18.5 p-5 mt-1 rounded-2xl fixed mx-auto flex items-center justify-between bg-background/80 backdrop-blur-xl border border-border shadow-2xl">
      <SkeletonPulse className="w-32 h-6" />
      <div className="flex gap-4 items-center">
        <SkeletonPulse className="w-14 h-4 hidden qw:block" />
        <SkeletonPulse className="w-14 h-4 hidden qw:block" />
        <SkeletonPulse className="w-14 h-4 hidden qw:block" />
        <SkeletonPulse className="size-7 rounded-full" />
        <SkeletonPulse className="size-7 rounded-full" />
      </div>
    </nav>
  );
}
