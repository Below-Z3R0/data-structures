import type { ButtonProps } from "../types";

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
