import { EyebrowReveal } from "../animations/Animations";
import { Paragraph, Title2, Title3 } from "../components";
import { ProjectCard } from "../molecules/ProjectCard";
import type { ProjectsSectionProps } from "../types";

export function IASection({
  project_section_data,
  projects_array_data,
  currentLang,
}: ProjectsSectionProps) {
  return (
    <section id="Proyects" className="flex flex-col gap-10">
      {/* Cabecera de la sección */}
      <div className="flex items-start flex-col gap-4">
        <EyebrowReveal>
          <Title3 txt={project_section_data.title_sm} />
        </EyebrowReveal>

        <Title2 txt={project_section_data.title_lg} className="text-pine!" />

        <Paragraph className="max-w-2xl" txt={project_section_data.paragraph} />
      </div>

      {/* Grid de Proyectos con SectionReveal stagger */}
      <div className="w-full flex flex-wrap qw:flex-row gap-8 flex-col">
        {projects_array_data.map((project) => (
          <ProjectCard
            key={`${project.key}-${currentLang}`}
            project_data={project}
            labels_data={project_section_data.labels}
            category={project_section_data.title_lg}
          />
        ))}
      </div>
    </section>
  );
}
