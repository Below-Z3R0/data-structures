import { NoiseTexture } from "@/services/assets/Icons";

export function BackgroundFX() {
  return (
    <div
      aria-hidden="true"
      className="bg-fx fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <div className="bg-grid" />
      <NoiseTexture className="bg-fx__noise" />
      <div className="bg-fx__vignette" />
    </div>
  );
}
