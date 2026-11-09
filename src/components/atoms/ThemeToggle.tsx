"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/hooks/useTheme";
import { Button } from "../components";

/**
 * Boton que alterna entre la paleta clara y la oscura.
 *
 * Antes del primer render no se sabe el tema resuelto (vive en
 * localStorage), asi que se renderiza un placeholder de tamano fijo para
 * evitar el salto de layout del anti-FOUC.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark" || theme === "rosepine-dark";

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Cambiar tema"
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-hover rounded-md transition-colors duration-200 border border-border"
      >
        <span className="size-5 inline-block" />
      </button>
    );
  }

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambiar tema"
      icon={
        isDark ? (
          <Sun className="size-5 text-foreground" />
        ) : (
          <Moon className="size-5 text-foreground" />
        )
      }
      buttonBody="p-2 text-muted-foreground hover:text-foreground hover:bg-hover rounded-md transition-colors duration-200 border border-border"
    />
  );
}
