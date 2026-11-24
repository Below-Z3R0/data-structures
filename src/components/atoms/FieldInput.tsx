"use client";

import type { HTMLInputTypeAttribute } from "react";

/**
 * Campo de formulario con label e input.
 *
 * El error de validacion no se muestra aca: segun el flujo de la app, un
 * valor invalido dispara un modal de error, no un mensaje inline. Asi el
 * input queda limpio y el feedback es unico.
 *
 * Los props van declarados aca: el campo es UI compartida y no depende de
 * los contratos del dominio de estructuras.
 */
export function FieldInput({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onSubmit,
}: {
  id: string;
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onSubmit) {
            event.preventDefault();
            onSubmit();
          }
        }}
        className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/25"
      />
    </div>
  );
}
