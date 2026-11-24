/**
 * Contrato de los titulos: el texto y las clases extra del consumidor.
 */
export type TitleProps = {
  txt: string | undefined;
  className?: string;
};

export function Title1({ txt, className }: TitleProps) {
  return (
    <h1
      className={`${className ?? ""} text-5xl text-wrap-balance tracking-tight text-left`}
    >
      {txt}
    </h1>
  );
}
