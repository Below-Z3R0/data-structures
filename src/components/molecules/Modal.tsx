import { m } from "motion/react";
import {
  Button,
  Paragraph,
  TecnologiesCard,
  Title2,
  Title3,
} from "../components";
import type { ModalProps } from "../types";

export function Modal({
  img,
  data,
  in_construction,
  onClose,
  activeTxt,
  setActivetxt,
}: ModalProps) {
  return (
    <m.div
      // Backdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <m.div
        // Modal content
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 30 }}
        transition={{ type: "spring" }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-232 h-210 rounded-3xl bg-card border border-accent/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="relative h-60 w-full">
          <Button
            img={img}
            imgStyle="object-cover mask-b-to-80%"
            buttonBody="h-100 pointer-events-none w-full"
          />
          <div className="absolute inset-0 flex flex-col justify-end pl-20">
            <Title3 txt={data.category} />
            <Title2 txt={data.title} />
          </div>
        </div>

        <div className="h-full px-20 pt-5 space-y-3">
          {activeTxt
            ? activeTxt
                .split(/\n\s*\n/)
                .filter((p) => p.trim().length > 0)
                .map((paragraph) => (
                  <Paragraph
                    key={paragraph.slice(0, 32)}
                    className="text-[0.97rem]"
                    txt={paragraph}
                  />
                ))
            : null}
        </div>

        <div className="flex gap-4 mb-3">
          {data.tecnologies.map((item) => (
            <Button
              buttonBody={`size-8 cursor-pointer ${in_construction}`}
              onClick={() =>
                setActivetxt(
                  activeTxt === item.description
                    ? data.paragraph
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
      </m.div>
    </m.div>
  );
}
