"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "rosepine-dark" | "rosepine-light";

export const ThemeData: string[] = [
  "Light",
  "Dark",
  "Rosepine-Dark",
  "Rosepine-Light",
];

export function useTheme() {
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme: Theme =
    mounted &&
    (resolvedTheme === "dark" ||
      resolvedTheme === "light" ||
      resolvedTheme === "rosepine-dark" ||
      resolvedTheme === "rosepine-light")
      ? resolvedTheme
      : "rosepine-dark";

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  return { theme: currentTheme, setTheme };
}
