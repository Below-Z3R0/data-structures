"use client";

import { AlertTriangle, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import {
  crearPila,
  type ErrorPila,
  editarPila,
  type HistorialPila,
  meter,
  type Pila,
  registrarEstado,
  regresar,
  sacar,
  valoresPila,
} from "@/services/data-structures/pila";
import { Button, Modal, PilaInput, PilaVisualizer } from "../components";
import type { PilaViewData } from "../types";

/** Modales posibles de la seccion de pila. */
type ModalPila = "insertar" | "eliminar" | "editar" | "error" | null;

/**
 * Organismo de la estructura PILA.
 *
 * Es la hoja con estado: guarda el contenido de la pila, el historial
 * para "Regresar" y el modal abierto. Toda la logica de la estructura
 * vive en `@/services/data-structures/pila`; este componente solo la
 * orquesta y la muestra.
 */
export function PilaSection({ data }: { data: PilaViewData }) {
  const { labels, buttons, modal: modalText, errors } = data;

  const [pila, setPila] = useState<Pila>(crearPila);
  const [historial, setHistorial] = useState<HistorialPila>({ estados: [] });
  const [modalAbierto, setModalAbierto] = useState<ModalPila>(null);
  const [errorMensaje, setErrorMensaje] = useState<string>("");

  // Valores de los formularios de los modales.
  const [valorInsercion, setValorInsercion] = useState("");
  const [valoresEdicion, setValoresEdicion] = useState("");

  /** Cierra el modal y limpia los formularios. */
  const cerrarModal = () => {
    setModalAbierto(null);
    setValorInsercion("");
    setValoresEdicion("");
  };

  /** Muestra el modal de error con el mensaje del codigo de error. */
  const mostrarError = (error: ErrorPila | "sin_historial") => {
    setErrorMensaje(
      error === "sin_historial" ? errors.sin_historial : errors[error],
    );
    setModalAbierto("error");
  };

  /**
   * Aplica una operacion que cambia la pila: guarda el estado actual en
   * el historial y actualiza la pila.
   */
  const aplicar = (nuevaPila: Pila) => {
    setHistorial((hist) => registrarEstado(hist, pila));
    setPila(nuevaPila);
  };

  // ---------------------------------------------------------------------------
  // OPERACIONES
  // ---------------------------------------------------------------------------

  /** METER: inserta un valor desde el modal de insercion. */
  const confirmarInsercion = () => {
    const texto = valorInsercion.trim();
    const numero = Number(texto);

    if (!/^\d+$/.test(texto)) {
      mostrarError("VALOR_INVALIDO");
      return;
    }

    const resultado = meter(pila, numero);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor);
    cerrarModal();
  };

  /** SACAR: extrae el valor de la cima (con confirmacion previa). */
  const confirmarEliminacion = () => {
    const resultado = sacar(pila);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor.pila);
    cerrarModal();
  };

  /** EDICION COMPLETA: reemplaza el contenido de la pila. */
  const confirmarEdicion = () => {
    const partes = valoresEdicion
      .split(",")
      .map((parte) => parte.trim())
      .filter((parte) => parte.length > 0);

    const numeros = partes.map((parte) =>
      /^\d+$/.test(parte) ? Number(parte) : Number.NaN,
    );

    const resultado = editarPila(numeros);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor);
    cerrarModal();
  };

  /** REGRESAR: vuelve al estado anterior de la pila. */
  const handleRegresar = () => {
    const resultado = regresar(historial);
    if (!resultado.ok) {
      mostrarError("sin_historial");
      return;
    }

    setPila(resultado.valor.pila);
    setHistorial(resultado.valor.historial);
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const valoresActuales = valoresPila(pila);

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Representacion grafica de la pila */}
      <PilaVisualizer pila={pila} labels={labels} />

      {/* Botones de operacion */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => setModalAbierto("insertar")}
          icon={<Plus className="size-4" />}
          txt={buttons.insertar}
          buttonBody="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          txtStyle="text-primary-foreground!"
        />

        <Button
          onClick={() => setModalAbierto("eliminar")}
          icon={<Trash2 className="size-4" />}
          txt={buttons.eliminar}
          buttonBody="h-11 px-6 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-hover hover:border-destructive active:scale-95 transition-all"
        />

        <Button
          onClick={handleRegresar}
          icon={<RotateCcw className="size-4" />}
          txt={buttons.regresar}
          disabled={historial.estados.length === 0}
          buttonBody="h-11 px-6 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-hover active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
        />

        <Button
          onClick={() => {
            setValoresEdicion(valoresActuales.join(", "));
            setModalAbierto("editar");
          }}
          icon={<Pencil className="size-4" />}
          txt={buttons.editar}
          buttonBody="h-11 px-6 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-hover active:scale-95 transition-all"
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* MODALES                                                          */}
      {/* ---------------------------------------------------------------- */}

      {/* Insertar un valor */}
      <Modal
        open={modalAbierto === "insertar"}
        onClose={cerrarModal}
        title={modalText.insertar_titulo}
        footer={
          <>
            <Button
              onClick={cerrarModal}
              txt={modalText.cancelar}
              buttonBody="h-10 px-5 rounded-lg bg-popover border border-border text-foreground font-medium hover:bg-hover transition-all"
            />
            <Button
              onClick={confirmarInsercion}
              txt={modalText.aceptar}
              buttonBody="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
              txtStyle="text-primary-foreground!"
            />
          </>
        }
      >
        <PilaInput
          id="valor-insercion"
          label={modalText.insertar_label}
          placeholder={modalText.insertar_placeholder}
          type="number"
          value={valorInsercion}
          onChange={setValorInsercion}
          onSubmit={confirmarInsercion}
        />
      </Modal>

      {/* Confirmar eliminacion */}
      <Modal
        open={modalAbierto === "eliminar"}
        onClose={cerrarModal}
        title={modalText.eliminar_titulo}
        variant="danger"
        footer={
          <>
            <Button
              onClick={cerrarModal}
              txt={modalText.cancelar}
              buttonBody="h-10 px-5 rounded-lg bg-popover border border-border text-foreground font-medium hover:bg-hover transition-all"
            />
            <Button
              onClick={confirmarEliminacion}
              txt={modalText.confirmar}
              buttonBody="h-10 px-5 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:opacity-90 transition-all"
              txtStyle="text-destructive-foreground!"
            />
          </>
        }
      >
        <p className="text-muted-foreground text-left">
          {modalText.eliminar_mensaje}
        </p>
      </Modal>

      {/* Editar el contenido completo */}
      <Modal
        open={modalAbierto === "editar"}
        onClose={cerrarModal}
        title={modalText.editar_titulo}
        footer={
          <>
            <Button
              onClick={cerrarModal}
              txt={modalText.cancelar}
              buttonBody="h-10 px-5 rounded-lg bg-popover border border-border text-foreground font-medium hover:bg-hover transition-all"
            />
            <Button
              onClick={confirmarEdicion}
              txt={modalText.confirmar}
              buttonBody="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
              txtStyle="text-primary-foreground!"
            />
          </>
        }
      >
        <PilaInput
          id="valores-edicion"
          label={modalText.editar_label}
          placeholder={modalText.editar_placeholder}
          value={valoresEdicion}
          onChange={setValoresEdicion}
          onSubmit={confirmarEdicion}
        />
      </Modal>

      {/* Error */}
      <Modal
        open={modalAbierto === "error"}
        onClose={cerrarModal}
        title={labels.cima}
        variant="danger"
        footer={
          <Button
            onClick={cerrarModal}
            txt={modalText.aceptar}
            buttonBody="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
            txtStyle="text-primary-foreground!"
          />
        }
      >
        <div className="flex items-start gap-3 text-left">
          <AlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
          <p className="text-muted-foreground">{errorMensaje}</p>
        </div>
      </Modal>

      {/* Contenido actual (referencia para el usuario) */}
      <AnimatePresence>
        {valoresActuales.length > 0 && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            {valoresActuales.join(" · ")}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}
