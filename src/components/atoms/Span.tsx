import type { SpanProps } from "../types";

export function Span({ txt, className, children, role, id }: SpanProps) {
  return (
    <span
      id={id}
      role={role}
      className={`text-foreground font-sans text-lg text-balance leading-relaxed font-medium ${className ?? ""}`}
    >
      {children}
      {txt}
    </span>
  );
}
