"use client";
import { useState } from "react";
import { Button } from "../components";
import { type Theme, ThemeData, useTheme } from "../hooks/useTheme";

export function ThemeSwitcher({
  ThemeMenuOrganization,
}: {
  ThemeMenuOrganization?: string;
}) {
  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Button
        svg={"daynight"}
        buttonBody="size-7 z-50"
        svgStyle="text-foreground hover:text-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Cambiar paleta"
      />

      {isOpen && (
        <div
          className={`-z-10 mt-50 ml-70 mx-auto absolute w-40 rounded-md p-2 gap-2 flex flex-col items-end bg-background/98 backdrop-blur-xl border border-border shadow-2xl ${ThemeMenuOrganization ?? ""}`}
        >
          {ThemeData.map((cat) => (
            <Button
              onClick={() => setTheme(cat.toLowerCase() as Theme)}
              key={cat}
              txt={cat}
              buttonBody="flex items-start h-8 w-full p-1 rounded-md"
              txtStyle="hover:text-primary"
            />
          ))}
        </div>
      )}
    </>
  );
}
