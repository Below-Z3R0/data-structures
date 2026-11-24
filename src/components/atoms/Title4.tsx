import type { TitleProps } from "./Title1";

export function Title4({ txt, className }: TitleProps) {
  return (
    <h4
      className={`text-lg text-wrap-balance tracking-tight text-left ${className ?? ""}`}
    >
      {txt}
    </h4>
  );
}
