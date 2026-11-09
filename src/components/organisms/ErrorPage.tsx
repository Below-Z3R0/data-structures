import { Button, Paragraph, Title2 } from "../components";
import type { ErrorStateProps } from "../types";

export function ErrorPage({
  message = "Hubo un error al cargar los datos del portafolio.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Icono con resplandor de advertencia */}
        <div className="relative">
          <div className="absolute inset-0 bg-destructive-soft blur-2xl rounded-full" />
          <div className="relative bg-destructive-soft p-4 rounded-full border border-destructive/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 text-destructive"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        {/* Texto informativo */}
        <div className="space-y-2">
          <Title2
            className="text-2xl font-display font-bold text-foreground"
            txt="¡Ups! Algo salió mal"
          />
          <Paragraph className="text-muted-foreground text-sm" txt={message} />
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {onRetry && (
            <Button
              onClick={onRetry}
              buttonBody="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
              txt="Reintentar"
              svg={"refresh_cw"}
              svgStyle="w-4 h-4"
            />
          )}

          <Button
            onClick={() => (window.location.href = "/")}
            buttonBody="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-popover border border-border text-foreground rounded-lg font-medium hover:bg-hover transition-all active:scale-95"
            txt="Inicio"
            svg={"home"}
            svgStyle="w-4 h-4"
          />
        </div>

        {/* Detalle sutil de decoración */}
        <div className="pt-4">
          <div className="h-1 w-12 bg-destructive/30 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
