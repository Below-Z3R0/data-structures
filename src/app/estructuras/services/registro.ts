/**
 * Registro de estructuras de datos disponibles en la app.
 *
 * Cada estructura declara su identificador, su etiqueta visible y el
 * componente que la representa. Agregar una estructura nueva es agregar
 * una entrada a este array: el menu de la pagina la renderiza sola.
 *
 * Por ahora solo hay PILA (requisito 1 de la tarea).
 */

export type EstructuraId = "pila";

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
