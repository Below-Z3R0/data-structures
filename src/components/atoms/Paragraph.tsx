/**
 * Contrato del parrafo: el texto y las clases extra del consumidor.
 */
export interface ParagraphProps {
  txt: string | undefined;
  className?: string;
}

export function Paragraph({ txt, className }: ParagraphProps) {
  return (
    <p
      className={`${className ?? ""} text-left text-lg leading-relaxed text-muted-foreground`}
    >
      {txt}
    </p>
  );
}
