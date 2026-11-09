"use client";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Button,
  LinkButton,
  Modal,
  Paragraph,
  TecnologiesCard,
  Title2,
  Title4,
} from "../components";
import type { ProjectCardProps } from "../types";

export function ProjectCard({
  project_data,
  labels_data,
  category,
}: ProjectCardProps) {
  const [activeTxt, setActiveTxt] = useState(project_data.data.paragraph);
  const [activeModalTxt, setActiveModalTxt] = useState(
    project_data.data.modal?.paragraph,
  );
  const handleReset = () => setActiveTxt(project_data.data.paragraph);
  const [isOpen, setIsOpen] = useState(false);
  const in_construction = project_data.meta.is_in_construction
    ? "opacity-65 cursor-not-allowed pointer-events-none "
    : "";

  return (
    <article
      className={`${project_data.meta.image_key !== undefined ? "max-h-220" : "qw:max-w-[47.9%] max-h-120"} mx-auto qw:h-95 w-full h-auto rounded-xl flex qw:flex-row flex-col-reverse justify-between p-5 bg-card border border-border shadow-lg transition-all ${project_data.meta.is_in_construction ? "hover:ring-1 hover:ring-destructive" : "hover:border-ring"}`}
    >
      <div
        className={`${project_data.meta.image_key === undefined ? "" : "qw:w-[50%] "} h-full w-full flex flex-col mt-3 qw:mt-0 items-start gap-1`}
      >
        {project_data.meta.is_relevant && (
          <Title4
            className="w-40 h-10 rounded-xl flex justify-center items-center bg-primary-soft text-love text-[10px] font-bold uppercase ring-1 ring-love/40"
            txt={labels_data.featured}
          />
        )}

        {project_data.meta.is_in_construction && (
          <Title4
            className="w-40 h-10 rounded-xl flex justify-center items-center bg-warning-soft text-warning text-[10px] font-bold uppercase ring-1 ring-warning/40"
            txt={labels_data.in_construction}
          />
        )}

        <Title2
          txt={project_data.meta.title}
          className="text-primary/80! mt-1 text-3xl!"
        />

        <Paragraph className="h-full text-[0.97rem]!" txt={activeTxt} />

        <div className="flex flex-col gap-2 w-full">
          {/* Links GitHub / Live Demo — ahora con underline + iconos */}
          <div className="flex justify-start gap-3 mt-5">
            <LinkButton
              txtStyle={`text-sm hover:text-primary ${in_construction}`}
              txt="Live Demo"
              link={project_data.meta.link_live_demo}
            />
            <LinkButton
              txtStyle={`text-sm hover:text-primary ${in_construction}`}
              txt="GitHub"
              link={project_data.meta.link_github}
            />
          </div>

          <div className="w-full flex justify-between items-center gap-3 mt-2">
            {/* Tech icons más grandes (size-10) con label visible */}
            <div className="flex">
              {project_data.data.tecnologies.map((item) => (
                <Button
                  buttonBody={`size-10 cursor-pointer ${in_construction}`}
                  onClick={() =>
                    setActiveTxt(
                      activeTxt === item.description
                        ? project_data.data.paragraph
                        : item.description,
                    )
                  }
                  key={item.name}
                  aria-label={item.name}
                >
                  <TecnologiesCard
                    cardStyle="bg-transparent! border-none! p-0! h-12! w-8! shadow-none!"
                    svg={item.icon_key}
                    color={item.color}
                    bar={true}
                  />
                </Button>
              ))}
            </div>
            {/* Return button — más claro, siempre visible */}
            <Button
              buttonBody={`cursor-pointer h-9 px-4 rounded-full bg-popover border border-border transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] ${in_construction}`}
              txtStyle="text-[11px] font-bold uppercase tracking-widest"
              txt="↺ Reset"
              onClick={handleReset}
            />
          </div>
        </div>
      </div>

      {project_data.meta.image_key && (
        <div className="relative group qw:w-[47.9%] qw:h-full h-auto ">
          <div
            className={`absolute inset-0 opacity-0 group-hover:blur-lg group-hover:opacity-65 z-0 ${project_data.meta.is_in_construction ? "group-hover:bg-destructive" : "group-hover:bg-accent"}`}
          />
          <Button
            buttonBody={`rounded-xl size-full overflow-hidden border border-border hover:border-accent cursor-pointer ${in_construction}`}
            img={project_data.meta.image_key}
            imgStyle="object-cover group-hover:scale-110 transition-transform z-1"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      )}

      <AnimatePresence>
        {project_data.meta.image_key && project_data.data.modal && isOpen && (
          <Modal
            img={project_data.meta.image_key}
            data={{
              ...project_data.data.modal,
              title: project_data.meta.title,
              category: category,
            }}
            in_construction={in_construction}
            activeTxt={activeModalTxt}
            setActivetxt={setActiveModalTxt}
            open={isOpen}
            onClose={() => setIsOpen(!isOpen)}
          />
        )}
      </AnimatePresence>
    </article>
  );
}
