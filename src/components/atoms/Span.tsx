import type { ReactNode } from "react";

/**
 * Contrato del span: texto, contenido y atributos de accesibilidad.
 */
export interface SpanProps {
  txt: string | undefined;
  className?: string;
  children?: ReactNode;
  id?: string;
  role?: string;
}

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
