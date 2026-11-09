import { AnimatePresence, m } from "motion/react";
import { Button } from "../components";
import type { SuccessMessageProps } from "../types";

export function SuccessMessage({
  show,
  onClose,
  title = "¡Mensaje enviado!",
  message = "Gracias por contactarme. Te responderé lo antes posible.",
}: SuccessMessageProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-card border border-success/40 shadow-2xl overflow-hidden"
          >
            {/* Glow decorativo de fondo */}
            <div
              className="absolute inset-0 opacity-30 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at top, var(--glow-accent) 0%, transparent 70%)",
              }}
            />

            <div className="relative p-8 flex flex-col items-center text-center gap-5">
              {/* Checkmark animado */}
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="size-20 rounded-full bg-success-soft border-2 border-success flex items-center justify-center"
              >
                <svg
                  className="size-10 text-success"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <title>Success</title>
                  <m.path
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                  />
                </svg>
              </m.div>

              {/* Textos */}
              <div className="space-y-2">
                <m.h3
                  id="success-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-2xl font-bold text-foreground tracking-tight"
                >
                  {title}
                </m.h3>
                <m.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  {message}
                </m.p>
              </div>

              {/* Botón de cierre */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Button
                  txt="Cerrar"
                  onClick={onClose}
                  buttonBody="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                />
              </m.div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
