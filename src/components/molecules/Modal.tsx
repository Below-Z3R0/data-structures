"use client";

import { X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Button } from "../components";
import type { ModalProps } from "../types";

/**
 * Modal generico con backdrop, titulo, contenido y zona de acciones.
 *
 * El `exit` de AnimatePresence hace que el cierre sea animado: el
 * componente se monta/desmonta desde el padre y el modal desaparece con
 * fade + scale.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  variant = "default",
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 30 }}
            transition={{ type: "spring" }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-120 rounded-3xl bg-card border border-accent/40 shadow-2xl overflow-hidden flex flex-col"
          >
            {title && (
              <div className="flex items-start justify-between gap-4 px-8 pt-7 pb-2">
                <h3 className="text-xl font-display font-semibold text-foreground">
                  {title}
                </h3>
                <Button
                  onClick={onClose}
                  aria-label="Cerrar"
                  icon={<X className="size-4 text-muted-foreground" />}
                  buttonBody="p-1 rounded-md hover:bg-hover transition-colors"
                />
              </div>
            )}

            <div className="px-8 py-4 overflow-y-auto">{children}</div>

            {footer && (
              <div
                className={`flex gap-3 justify-end px-8 py-6 border-t border-border ${
                  variant === "danger" ? "border-destructive/30" : ""
                }`}
              >
                {footer}
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
