import type {
  ColaButtons,
  ColaContent,
  ColaErrors,
  ColaLabels,
  ColaModal,
  EstructuraMetadata,
  HeroContent,
  HeroLabels,
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
  /** Etiqueta de la marca CIMA (para el aria-label). */
  cimaLabel: string;
}

export interface ColaCellProps {
  /** Indice de la celda en el arreglo (base 0). */
  index: number;
  /** Valor almacenado, o null si la celda esta libre. */
  value: number | null;
  /** Marca la celda ocupada por un elemento de la cola. */
  ocupada: boolean;
  /** Marca la celda que apunta FRENTE. */
  esFrente: boolean;
  /** Marca la celda que apunta FINAL. */
  esFinal: boolean;
  /** Etiqueta del eje de indices. */
  indiceLabel: string;
  /** Etiqueta del badge FRENTE. */
  frenteLabel: string;
  /** Etiqueta del badge FINAL. */
  finalLabel: string;
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
  cola: ColaContent;
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

/**
 * Datos que el container le pasa a la seccion de la cola.
 *
 * Espeja `PilaViewData`: la seccion no sabe de donde salen los textos,
 * solo los recibe traducidos.
 */
export interface ColaViewData {
  title: string;
  paragraph: string;
  labels: ColaLabels;
  buttons: ColaButtons;
  modal: ColaModal;
  errors: ColaErrors;
}

// =============================================================================
// RE-EXPORTS — para que los componentes solo importen de types.ts
// =============================================================================

export type {
  ColaButtons,
  ColaContent,
  ColaErrors,
  ColaLabels,
  ColaModal,
  EstructuraMetadata,
  HeroContent,
  HeroLabels,
  HeroMetadata,
  PilaButtons,
  PilaContent,
  PilaErrors,
  PilaLabels,
  PilaModal,
};
