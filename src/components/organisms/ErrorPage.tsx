import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { Button, Paragraph, Title2 } from "../components";

/**
 * Pantalla de error centralizada.
 *
 * Nunca muestra el mensaje crudo del error: puede filtrar paths o
 * estructura interna. El detalle real se loguea en el servidor.
 */
export function ErrorPage({
  message = "Hubo un error al cargar los datos.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Icono con resplandor de advertencia */}
        <div className="relative">
          <div className="absolute inset-0 bg-destructive-soft blur-2xl rounded-full" />
          <div className="relative bg-destructive-soft p-4 rounded-full border border-destructive/20">
            <AlertTriangle className="size-12 text-destructive" />
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
              icon={<RotateCw className="w-4 h-4" />}
              buttonBody="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
              txt="Reintentar"
            />
          )}

          <Button
            onClick={() => (window.location.href = "/")}
            icon={<Home className="w-4 h-4" />}
            buttonBody="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-popover border border-border text-foreground rounded-lg font-medium hover:bg-hover transition-all active:scale-95"
            txt="Inicio"
          />
        </div>

        {/* Detalle sutil de decoracion */}
        <div className="pt-4">
          <div className="h-1 w-12 bg-destructive/30 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
