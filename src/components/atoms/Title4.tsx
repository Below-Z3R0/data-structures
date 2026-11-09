import type { TitleProps } from "../types";

export function Title4({ txt, className }: TitleProps) {
  return (
    <h4
      className={`text-lg text-wrap-balance tracking-tight text-left ${className ?? ""}`}
    >
      {txt}
    </h4>
  );
}
