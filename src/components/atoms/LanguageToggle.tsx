"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../components";

export function LanguageToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get("lang") || "es";

  const toggleLanguage = () => {
    const newLang = currentLang === "es" ? "en" : "es";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);
    router.push(`?${params.toString()}`);
  };

  return (
    <Button
      onClick={toggleLanguage}
      svg={"language"}
      buttonBody="size-7 z-50"
      svgStyle="text-foreground hover:text-primary"
    />
  );
}
