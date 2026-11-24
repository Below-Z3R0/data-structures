/**
 * Registro de estructuras de datos disponibles en la app.
 *
 * Este archivo es el catalogo de TIPOS: `ESTRUCTURA_IDS` es la fuente unica
 * de `EstructuraId` y el enum con el que el schema valida el `id` del
 * payload. El menu NO se alimenta de aca: lo hace
 * `metadata["section.hero"].estructuras` de los JSON estaticos. Agregar
 * una estructura es agregar su id a `ESTRUCTURA_IDS` y su entrada a los
 * dos JSON (ver docs/estructuras/README.md).
 *
 * Por ahora estan PILA (requisito 1 de la tarea) y COLA (requisito 2).
 */

/**
 * Identificadores validos de estructura. Es la fuente unica del tipo
 * `EstructuraId` y del enum con el que se valida el catalogo del payload.
 */
export const ESTRUCTURA_IDS = ["pila", "cola"] as const;

/** Id de una estructura de datos disponible. */
export type EstructuraId = (typeof ESTRUCTURA_IDS)[number];

export interface EstructuraInfo {
  /** Identificador estable, usado como clave de render. */
  id: EstructuraId;
  /** Etiqueta visible en el menu de estructuras. */
  label: string;
  /** Descripcion corta, usada como texto de apoyo. */
  description: string;
}

/** Estructuras disponibles, en el orden en que se muestran en el menu. */
export const ESTRUCTURAS: EstructuraInfo[] = [
  {
    id: "pila",
    label: "Pila",
    description: "Ultimo en entrar, primero en salir (LIFO)",
  },
  {
    id: "cola",
    label: "Cola",
    description: "Primero en entrar, primero en salir (FIFO)",
  },
];

/**
 * Devuelve la metadata de una estructura por su id.
 */
export function obtenerEstructura(id: EstructuraId): EstructuraInfo {
  const encontrada = ESTRUCTURAS.find((estructura) => estructura.id === id);
  if (!encontrada) {
    throw new Error(`[structures] Estructura desconocida: "${id}"`);
  }
  return encontrada;
}
