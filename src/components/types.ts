import type {
  ButtonHTMLAttributes,
  HTMLInputTypeAttribute,
  MouseEventHandler,
  ReactNode,
} from "react";

// =============================================================================
// TIPOS INFERIDOS DE SCHEMAS.TS (tipos de dominio)
// =============================================================================

import type {
  EstructuraMetadata,
  HeroContent,
  HeroMetadata,
  PilaButtons,
  PilaContent,
  PilaErrors,
  PilaLabels,
  PilaModal,
} from "./schemas";

// =============================================================================
// GLOBALES
// =============================================================================

export type Theme = "dark" | "light" | "rosepine-dark" | "rosepine-light";
export type Language = "en" | "es";

// =============================================================================
// ATOMS — contratos UI puros (sin lógica de negocio)
// =============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  /** Icono renderizado a la izquierda del texto (componente de lucide-react). */
  icon?: ReactNode;
  txt?: string | null;
  buttonBody?: string;
  txtStyle?: string;
}

export type TitleProps = {
  txt: string | undefined;
  className?: string;
};

export interface SpanProps extends TitleProps {
  children?: ReactNode;
  id?: string;
  role?: string;
}

export interface ParagraphProps {
  txt: string | undefined;
  className?: string;
}

// =============================================================================
// MOLECULES — UI con data del orquestador
// =============================================================================

/**
 * Modal generico: backdrop, contenido y cierre.
 *
 * `footer` es la zona de acciones (confirmar / cancelar). El contenido
 * principal va en `children`.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Variante visual del modal. */
  variant?: "default" | "danger";
}

export interface PilaCellProps {
  /** Indice de la celda en el arreglo (base 0). */
  index: number;
  /** Valor almacenado, o null si la celda esta libre. */
  value: number | null;
  /** Marca la celda que apunta CIMA. */
  isCima: boolean;
  /** Etiqueta del eje de indices. */
  indiceLabel: string;
}

/**
 * Campo de formulario con label, input y mensaje de error.
 */
export interface PilaInputProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

// =============================================================================
// ORGANISMS — secciones completas (reciben data del orquestador)
// =============================================================================

export interface HeroSectionProps {
  hero_data: {
    data: HeroContent;
    meta: HeroMetadata;
  };
}

export interface PilaSectionProps {
  pila_data: {
    data: PilaContent;
    meta: { estructuras: EstructuraMetadata[] };
  };
}

/**
 * Datos que la seccion de estructuras le pasa al visualizador de pila.
 *
 * Se agrupan en un objeto para que el componente no reciba ocho props
 * sueltos (regla: un prop que describe un dato, no una forma, vive mas
 * arriba).
 */
export interface PilaViewData {
  labels: PilaLabels;
  buttons: PilaButtons;
  modal: PilaModal;
  errors: PilaErrors;
}

// =============================================================================
// RE-EXPORTS — para que los componentes solo importen de types.ts
// =============================================================================

export type {
  EstructuraMetadata,
  HeroContent,
  HeroMetadata,
  PilaButtons,
  PilaContent,
  PilaErrors,
  PilaLabels,
  PilaModal,
};
