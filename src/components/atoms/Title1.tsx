import type { TitleProps } from "../types";

export function Title1({ txt, className }: TitleProps) {
  return (
    <h1
      className={`${className ?? ""} text-5xl text-wrap-balance tracking-tight text-left`}
    >
      {txt}
    </h1>
  );
}
