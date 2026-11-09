import { LinkButton, Paragraph, Title2, Title3 } from "../components";
import { Formulary } from "../molecules/Formulary";
import type { ContactSectionProps } from "../types";

export function ContactSection({ contact_data }: ContactSectionProps) {
  return (
    <section id="Contact" className="flex flex-col gap-4">
      <div className="rounded-3xl flex qw:flex-row flex-col qw:justify-between gap-10 max-ww:p-0 p-12 bg-card border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-64 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="qw:w-[50%] w-full flex flex-col max-ww:px-5 max-ww:pt-5 qw:justify-between justify-center qw:items-start items-center gap-4 relative z-10">
          <div className="w-full flex flex-col items-start gap-4 pb-10">
            <Title3 txt={contact_data.data.title_sm} />
            <Title2 txt={contact_data.data.title_lg} />
            <Paragraph
              className="text-muted-foreground"
              txt={contact_data.data.paragraph}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {contact_data.meta.map((item) => (
              <LinkButton
                key={item.id}
                buttonBody="rounded-xl h-12 w-auto flex flex-row-reverse justify-center items-center px-5 gap-3 bg-popover border border-border text-foreground hover:border-primary transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                svg={item.icon_key}
                svgStyle="h-6 w-6"
                link={item.link}
                txt={item.name}
              />
            ))}
          </div>
        </div>

        {/* Columna del Formulario */}
        <div className="qw:w-[45%] w-full relative max-ww:px-2 max-ww:pb-2">
          {contact_data.data.form && (
            <Formulary form_data={contact_data.data.form} />
          )}
        </div>
      </div>
    </section>
  );
}
