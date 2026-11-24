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
import type { EstructuraId } from "./services/registro";

// =============================================================================
// GLOBALES
// =============================================================================

export type Theme = "dark" | "light" | "rosepine-dark" | "rosepine-light";
export type Language = "en" | "es";

// =============================================================================
// ATOMS — contratos de los componentes del dominio de estructuras
// =============================================================================

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

// =============================================================================
// ORGANISMS — secciones completas (reciben data del orquestador)
// =============================================================================

export interface EstructurasHeroProps {
  data: HeroContent;
  estructuras: EstructuraMetadata[];
  menuLabel: string;
  activa: EstructuraId;
  onSelect: (id: EstructuraId) => void;
}

export interface EstructurasContainerProps {
  hero: {
    data: HeroContent;
    meta: HeroMetadata;
  };
  pila: PilaContent;
}

export interface EstructuraMenuProps {
  estructuras: EstructuraMetadata[];
  menuLabel: string;
  activa: EstructuraId;
  onSelect: (id: EstructuraId) => void;
}

/**
 * Datos que la seccion de estructuras le pasa al visualizador de pila.
 *
 * Se agrupan en un objeto para que el componente no reciba ocho props
 * sueltos (regla: un prop que describe un dato, no una forma, vive mas
 * arriba).
 */
export interface PilaViewData {
  title: string;
  paragraph: string;
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
