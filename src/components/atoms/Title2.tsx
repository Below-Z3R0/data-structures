import type { TitleProps } from "./Title1";

export function Title2({ txt, className }: TitleProps) {
  return (
    <h2
      className={`text-4xl text-wrap-balance tracking-tight text-left text-foreground ${className ?? ""}`}
    >
      {txt}
    </h2>
  );
}
