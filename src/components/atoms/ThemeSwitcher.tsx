"use client";

import { Palette } from "lucide-react";
import { useState } from "react";
import { Button } from "../components";
import { type Theme, ThemeData, useTheme } from "../hooks/useTheme";

/**
 * Menu de paletas: permite elegir entre las 4 del sistema de theming.
 */
export function ThemeSwitcher() {
  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <Button
        icon={<Palette className="size-5 text-foreground hover:text-primary" />}
        buttonBody="size-7 z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Elegir paleta"
        aria-expanded={isOpen}
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-40 rounded-md p-2 gap-2 flex flex-col items-center bg-background/98 shadow-2xl">
          {ThemeData.map((cat) => (
            <Button
              onClick={() => setTheme(cat.toLowerCase() as Theme)}
              key={cat}
              txt={cat}
              txtStyle="hover:text-primary"
            />
          ))}
        </div>
      )}
    </div>
  );
}
