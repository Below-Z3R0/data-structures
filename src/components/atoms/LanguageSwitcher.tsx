"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../components";

export function LanguageSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const changeLanguage = (newLang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);

    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <Button
        onClick={() => changeLanguage("en")}
        txt="English"
        txtStyle="text-[15px]!"
      />
      <Button
        onClick={() => changeLanguage("es")}
        txt="Español"
        txtStyle="text-[15px]!"
      />
    </div>
  );
}
