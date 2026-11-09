import {
  EyebrowReveal,
  StaggerGroup,
  StaggerItem,
} from "../animations/Animations";
import { Paragraph, TecnologiesCard, Title2, Title3 } from "../components";
import type { TecnologiesSectionProps } from "../types";

export function SkillsSection({ skills_data }: TecnologiesSectionProps) {
  return (
    <section id="Tecnologies" className="flex flex-col gap-10 pt-10">
      {/* Cabecera de la sección */}
      <div className="flex items-start flex-col gap-4">
        <EyebrowReveal>
          <Title3
            txt={skills_data.data.title_sm}
            className="uppercase text-primary"
          />
        </EyebrowReveal>
        <Title2 txt={skills_data.data.title_lg} className="text-foreground" />
        <Paragraph
          className="text-muted-foreground max-w-2xl"
          txt={skills_data.data.paragraph}
        />
      </div>

      {/* Listado por categorías con stagger */}
      {skills_data.meta.categories.map((cat) => (
        <div key={cat.name} className="flex flex-col items-start gap-6">
          <Title3
            txt={cat.name}
            className="text-primary border-l-2 border-primary/30 pl-4 text-sm"
          />
          <StaggerGroup className="flex flex-row flex-wrap justify-start gap-4 px-4 w-full">
            {cat.skills.map((skill) => (
              <StaggerItem key={skill.name}>
                <TecnologiesCard
                  name={skill.name}
                  svg={skill.icon_key}
                  color={skill.color}
                  bar={true}
                  cardStyle="gap-3"
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      ))}
    </section>
  );
}
