"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      enableSystem={false}
      defaultTheme="rosepine-dark"
      forcedTheme={undefined}
      themes={["light", "dark", "rosepine-dark", "rosepine-light"]}
    >
      {children}
    </NextThemesProvider>
  );
}
