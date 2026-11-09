"use client";
import { LucideLanguages } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "../components";

export function LanguageSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const changeLanguage = (newLang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);

    router.push(`?${params.toString()}`);
  };

  const [isOpen, setIsOpen] = useState(false);
  const button_data = [
    { lang: "en", txt: "English" },
    { lang: "es", txt: "Español" },
  ];

  return (
    <div className="relative">
      <Button
        icon={
          <LucideLanguages className="size-5 text-foreground hover:text-primary" />
        }
        buttonBody="size-7 z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Elegir idioma"
        aria-expanded={isOpen}
      />
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-40 rounded-md p-2 gap-2 flex flex-col items-center bg-background/98 shadow-2xl">
          {button_data.map((button) => (
            <Button
              key={button.lang}
              onClick={() => changeLanguage(button.lang)}
              txt={button.txt}
              txtStyle="hover:text-primary"
            />
          ))}
        </div>
      )}
    </div>
  );
}
