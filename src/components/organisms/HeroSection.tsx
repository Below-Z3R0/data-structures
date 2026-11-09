import Image from "next/image";
import { PopReveal, StaggerGroup, StaggerItem } from "../animations/Animations";
import { LinkButton, Paragraph, Title2 } from "../components";
import type { HeroSectionProps } from "../types";

export function HeroSection({ hero_data }: HeroSectionProps) {
  // Primer contacto del mapa general: el proyecto define cuantos y cuales.
  const social = Object.values(hero_data.meta.contacts)[0];

  return (
    <section id="Home" className="qw:pt-60">
      <StaggerGroup className="gap-4 flex flex-col justify-start items-start h-full">
        {/* Header: Foto y Status */}
        <StaggerItem>
          <div className="flex items-center gap-3">
            <Image
              src={`/${hero_data.meta.general.image_key}`}
              className="rounded-full size-25 border border-border object-cover bg-card ring-2 ring-primary/10"
              alt="Foto de perfil"
              width={80}
              height={80}
              priority
            />
            <PopReveal delay={0.3}>
              <LinkButton
                buttonBody="flex items-center rounded-full bg-primary-soft border border-border-glow h-8 pl-3 pr-4 transition-all hover:bg-primary-soft/60"
                txtStyle="text-xs font-semibold text-accent!"
                link={hero_data.meta.general.contact.link}
                txt={hero_data.data.workstatus}
              />
            </PopReveal>
          </div>
        </StaggerItem>

        {/* Textos Principales */}
        <StaggerItem>
          <Title2 txt={hero_data.data.title} className="mb-5" />
        </StaggerItem>
        <StaggerItem>
          <Paragraph className="max-w-2xl" txt={hero_data.data.paragraph_1} />
        </StaggerItem>
        <StaggerItem>
          <Paragraph className="max-w-2xl" txt={hero_data.data.paragraph_2} />
        </StaggerItem>

        {/* Navegación de Contacto Rápido */}
        <StaggerItem>
          <nav className="flex gap-4 mt-4">
            <LinkButton
              buttonBody="w-auto px-6 h-11 rounded-xl flex flex-row-reverse items-center justify-center gap-2 bg-primary transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              link={hero_data.meta.general.contact.link}
              txtStyle="font-bold text-primary-foreground"
              txt={hero_data.data.contact}
              svg={hero_data.meta.general.contact.icon_key}
              svgStyle="text-primary-foreground h-5 w-5"
            />
            {social && (
              <LinkButton
                buttonBody="w-auto px-6 h-11 rounded-xl flex flex-row-reverse items-center justify-center gap-2 bg-card border border-border hover:bg-hover hover:border-primary transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                link={social.link}
                txtStyle="text-foreground"
                txt={social.name}
                svg={social.icon_key}
                svgStyle="h-5 w-5"
              />
            )}
          </nav>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
