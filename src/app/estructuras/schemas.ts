import { z } from "zod";
import { ESTRUCTURA_IDS } from "./services/registro";

// =============================================================================
// SCHEMAS DE CONTENIDO (traducibles — viven en content)
// =============================================================================

/** Etiquetas accesibles de los controles de la cabecera. */
export const HeroLabelsSchema = z.object({
  idioma: z.string(),
  paleta: z.string(),
});

/** section.hero: textos de la cabecera. */
export const HeroContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  eyebrow: z.string(),
  paragraph: z.string(),
  labels: HeroLabelsSchema,
});

/** Etiquetas de la representacion grafica de la pila. */
export const PilaLabelsSchema = z.object({
  cima: z.string(),
  tamano: z.string(),
  vacia: z.string(),
  llena: z.string(),
  indice: z.string(),
  error: z.string(),
});

/** Textos de los botones de operacion. */
export const PilaButtonsSchema = z.object({
  insertar: z.string(),
  eliminar: z.string(),
  regresar: z.string(),
  editar: z.string(),
});

/** Textos de los modales. */
export const PilaModalSchema = z.object({
  insertar_titulo: z.string(),
  insertar_label: z.string(),
  insertar_placeholder: z.string(),
  eliminar_titulo: z.string(),
  eliminar_mensaje: z.string(),
  editar_titulo: z.string(),
  editar_label: z.string(),
  editar_placeholder: z.string(),
  cancelar: z.string(),
  confirmar: z.string(),
  aceptar: z.string(),
});

/** Mensajes de error de la pila, indexados por el codigo del error. */
export const PilaErrorsSchema = z.object({
  PILA_LLENA: z.string(),
  PILA_VACIA: z.string(),
  VALOR_INVALIDO: z.string(),
  CANTIDAD_INVALIDA: z.string(),
  sin_historial: z.string(),
});

/** section.pila: contenido de la seccion de estructuras de datos. */
export const PilaContentSchema = z.object({
  title: z.string(),
  paragraph: z.string(),
  labels: PilaLabelsSchema,
  buttons: PilaButtonsSchema,
  modal: PilaModalSchema,
  errors: PilaErrorsSchema,
});

// -----------------------------------------------------------------------------
// COLA
// -----------------------------------------------------------------------------

/** Etiquetas de la representacion grafica de la cola. */
export const ColaLabelsSchema = z.object({
  frente: z.string(),
  final: z.string(),
  max: z.string(),
  elementos: z.string(),
  libres: z.string(),
  vacia: z.string(),
  llena: z.string(),
  indice: z.string(),
  error: z.string(),
});

/** Textos de los botones de operacion de la cola. */
export const ColaButtonsSchema = z.object({
  insertar: z.string(),
  eliminar: z.string(),
  regresar: z.string(),
  editar: z.string(),
});

/** Textos de los modales de la cola. */
export const ColaModalSchema = z.object({
  insertar_titulo: z.string(),
  insertar_label: z.string(),
  insertar_placeholder: z.string(),
  eliminar_titulo: z.string(),
  eliminar_mensaje: z.string(),
  editar_titulo: z.string(),
  editar_label: z.string(),
  editar_placeholder: z.string(),
  cancelar: z.string(),
  confirmar: z.string(),
  aceptar: z.string(),
});

/** Mensajes de error de la cola, indexados por el codigo del error. */
export const ColaErrorsSchema = z.object({
  COLA_LLENA: z.string(),
  COLA_VACIA: z.string(),
  VALOR_INVALIDO: z.string(),
  CANTIDAD_INVALIDA: z.string(),
  sin_historial: z.string(),
});

/** section.cola: contenido de la seccion de la cola circular. */
export const ColaContentSchema = z.object({
  title: z.string(),
  paragraph: z.string(),
  labels: ColaLabelsSchema,
  buttons: ColaButtonsSchema,
  modal: ColaModalSchema,
  errors: ColaErrorsSchema,
});

// =============================================================================
// SCHEMAS DE METADATA (no traducibles)
// =============================================================================

/**
 * Una estructura de datos disponible en el menu.
 *
 * El id es el identificador tecnico; el label y la description son
 * traducibles, asi que viven en metadata (cada idioma trae su propio
 * payload con su propia etiqueta).
 */
export const EstructuraMetadataSchema = z.object({
  id: z.enum(ESTRUCTURA_IDS),
  label: z.string(),
  description: z.string(),
});

/** section.hero metadata: etiqueta del menu y estructuras disponibles. */
export const HeroMetadataSchema = z.object({
  menu_label: z.string(),
  estructuras: z.array(EstructuraMetadataSchema),
});

// =============================================================================
// TIPOS INFERIDOS
// =============================================================================

export type HeroContent = z.infer<typeof HeroContentSchema>;
export type PilaContent = z.infer<typeof PilaContentSchema>;
export type PilaLabels = z.infer<typeof PilaLabelsSchema>;
export type PilaButtons = z.infer<typeof PilaButtonsSchema>;
export type PilaModal = z.infer<typeof PilaModalSchema>;
export type PilaErrors = z.infer<typeof PilaErrorsSchema>;
export type ColaContent = z.infer<typeof ColaContentSchema>;
export type ColaLabels = z.infer<typeof ColaLabelsSchema>;
export type ColaButtons = z.infer<typeof ColaButtonsSchema>;
export type ColaModal = z.infer<typeof ColaModalSchema>;
export type ColaErrors = z.infer<typeof ColaErrorsSchema>;
export type HeroLabels = z.infer<typeof HeroLabelsSchema>;
export type HeroMetadata = z.infer<typeof HeroMetadataSchema>;
export type EstructuraMetadata = z.infer<typeof EstructuraMetadataSchema>;
