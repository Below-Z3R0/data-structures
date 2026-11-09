import Image from "next/image";
import { EyebrowReveal, SlideReveal } from "../animations/Animations";
import { Paragraph, Title2, Title3 } from "../components";
import type { AboutMeSectionProps } from "../types";

export function AboutMeSection({ aboutme_data }: AboutMeSectionProps) {
  return (
    <section
      id="AboutMe"
      className="flex lg:flex-nowrap lg:flex-row flex-col-reverse flex-wrap items-center"
    >
      <SlideReveal
        direction="left"
        className="qw:max-w[60%] w-full flex items-start flex-col gap-4"
      >
        {/* Títulos */}
        <EyebrowReveal>
          <Title3 txt={aboutme_data.data.title_sm} />
        </EyebrowReveal>
        <Title2 txt={aboutme_data.data.title_lg} />

        <div className="w-full h-full flex items-center justify-center">
          <Image
            src={`/${aboutme_data.meta.image_key}`}
            className="lg:hidden block max-w-60 w-full object-cover rounded-2xl mt-10 shadow-lg border border-border"
            alt="Imagen de la sección"
            width={240}
            height={240}
          />
        </div>

        {/* Contenido de texto */}
        <Paragraph
          className="qw:max-w-160 w-full"
          txt={aboutme_data.data.paragraph_1}
        />
        <Paragraph
          className="qw:max-w-160 w-full"
          txt={aboutme_data.data.paragraph_2}
        />
      </SlideReveal>

      <SlideReveal
        direction="right"
        delay={0.2}
        className="lg:block lg:w-full w-0 max-w-60"
      >
        <Image
          src={`/${aboutme_data.meta.image_key}`}
          className="w-full object-cover rounded-2xl shadow-lg border border-border"
          alt="Imagen de la sección"
          width={240}
          height={240}
        />
      </SlideReveal>
    </section>
  );
}
