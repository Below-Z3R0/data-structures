import { LinkButton, Paragraph } from "../components";
import type { FooterProps } from "../types";

export function Footer({ footer_data }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-20 flex flex-col items-center gap-8 px-5 max-w-280 mx-auto border-t border/50 border-primary mt-20">
      <nav
        aria-label="Navegación del pie de página"
        className="flex flex-wrap justify-center gap-6"
      >
        {footer_data.meta.map((item) => (
          <LinkButton
            key={item.id}
            link={item.link}
            buttonBody="text-muted-foreground hover:text-primary text-sm transition-colors"
            txt={item.name}
          />
        ))}
      </nav>
      <div className="flex flex-col items-center gap-2 mt-4">
        <Paragraph
          className="text-muted-foreground text-sm flex items-center gap-2"
          txt={footer_data.data.built_with}
        />
        <Paragraph
          className="text-muted-foreground text-xs tracking-wider uppercase"
          txt={`© ${currentYear} · ${footer_data.data.copyright}`}
        />
      </div>
    </footer>
  );
}
