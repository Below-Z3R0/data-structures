import { IconRender } from "../atoms/IconRender";
import { Title4 } from "../components";
import type { TecnologiesConfig } from "../types";

export function TecnologiesCard({
  name,
  svg,
  color,
  cardStyle,
  iconStyle,
  bar,
}: TecnologiesConfig) {
  return (
    <div
      style={{ "--tech-color": color } as React.CSSProperties}
      className={`w-36 group relative flex flex-col items-center justify-center p-4 bg-primary-container border border-border rounded-3xl transition-transform duration-300 hover:-translate-y-2 shadow-lg hover:bg-(--tech-color)/5 ${cardStyle}`}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-65 rounded-3xl group-hover:blur-2xl bg-(--tech-color)`}
      />

      <div
        className={`mb-3 group-hover:scale-110 transition-transform duration-300 ${iconStyle}`}
      >
        {svg && (
          <IconRender
            name={svg}
            className={`size-full text-(--tech-color) filter drop-shadow-[0_0_12px_var(--tech-color)]/50`}
          />
        )}
      </div>

      {name && <Title4 txt={name} />}

      {bar && (
        <div
          className={`absolute bottom-0 h-1 w-0 group-hover:w-1/2 transition-[width] duration-300 rounded-full bg-(--tech-color)`}
        />
      )}
    </div>
  );
}
