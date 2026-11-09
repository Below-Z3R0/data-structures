import { AnimatePresence, m } from "motion/react";
import { Button } from "../components";
import type { ErrorMessageProps } from "../types";

export function ErrorMessage({
  show,
  onClose,
  title = "Algo salió mal",
  message = "No pude enviar tu mensaje. Por favor intenta de nuevo.",
}: ErrorMessageProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="error-title"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-card border border-destructive/40 shadow-2xl overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-30 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at top, var(--glow-warning) 0%, transparent 70%)",
              }}
            />

            <div className="relative p-8 flex flex-col items-center text-center gap-5">
              {/* X animado */}
              <m.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="size-20 rounded-full bg-destructive-soft border-2 border-destructive flex items-center justify-center"
              >
                <svg
                  className="size-10 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  viewBox="0 0 24 24"
                >
                  <title>Error</title>
                  <m.path
                    d="M6 6l12 12M18 6L6 18"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  />
                </svg>
              </m.div>

              <div className="space-y-2">
                <m.h3
                  id="error-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-2xl font-bold text-foreground tracking-tight"
                >
                  {title}
                </m.h3>

                <m.h2
                  id="error-message"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-xl text-foreground tracking-tight"
                >
                  {message}
                </m.h2>
              </div>

              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex gap-3"
              >
                <Button
                  txt="Cerrar"
                  onClick={onClose}
                  buttonBody="h-11 px-6 rounded-xl bg-popover border border-border text-foreground hover:border-primary transition-colors"
                />
              </m.div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
