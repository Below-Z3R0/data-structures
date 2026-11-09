"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/components";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El mensaje crudo se registra en la consola del servidor, nunca se
    // muestra al usuario: puede filtrar SQL, paths o nombres de variables.
    console.error("Error critico en la pagina:", error);
  }, [error]);

  return (
    <ErrorPage
      message="Hubo un problema al cargar los datos del sitio. Probá de nuevo en unos minutos."
      onRetry={reset}
    />
  );
}
