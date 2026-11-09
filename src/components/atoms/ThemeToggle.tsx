"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/hooks/useTheme";
import { Button } from "../components";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Cambiar tema"
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-hover rounded-md transition-all duration-200 border border-border"
      >
        <span className="size-5 inline-block" />
      </button>
    );
  }

  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema"
      svg={"daynight"}
      svgStyle="text-foreground"
      buttonBody="p-2 text-muted-foreground hover:text-foreground hover:bg-hover rounded-md transition-all duration-200 border border-border"
    />
  );
}
