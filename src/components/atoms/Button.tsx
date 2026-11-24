import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

/**
 * Contrato del boton base del sistema de diseno.
 *
 * Vive aca y no en un archivo de tipos compartido: el boton es UI
 * compartida y su contrato no depende de ningun dominio.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  /** Icono renderizado a la izquierda del texto (componente de lucide-react). */
  icon?: ReactNode;
  txt?: string | null;
  buttonBody?: string;
  txtStyle?: string;
}

/**
 * Boton base del sistema de diseno.
 *
 * Acepta texto (`txt`), un icono (`icon`, componente de lucide-react) o
 * children. No tiene logica de negocio: el `onClick` lo inyecta quien lo
 * usa.
 */
export function Button({
  txt,
  icon,
  children,
  buttonBody = "",
  txtStyle,
  type = "button",
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`flex justify-center items-center gap-2 ${buttonBody}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon}
      {txt && (
        <span className={`text-foreground font-medium ${txtStyle ?? ""}`}>
          {txt}
        </span>
      )}
      {children}
    </button>
  );
}
