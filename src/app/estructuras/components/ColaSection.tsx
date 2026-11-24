"use client";

import { AlertTriangle, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { ColaVisualizer } from "@/app/estructuras/components/ColaVisualizer";
import {
  type Cola,
  crearCola,
  type ErrorCola,
  editarCola,
  eliminar,
  type HistorialCola,
  insertar,
  registrarEstado,
  regresar,
  valoresCola,
} from "@/app/estructuras/services/cola";
import type { ColaViewData } from "@/app/estructuras/types";
import { Button } from "@/components/atoms/Button";
import { FieldInput } from "@/components/atoms/FieldInput";
import { Title2 } from "@/components/atoms/Title2";
import { Modal } from "@/components/molecules/Modal";

/** Modales posibles de la seccion de cola. */
type ModalCola = "insertar" | "eliminar" | "editar" | "error" | null;

/**
 * Organismo de la estructura COLA.
 *
 * Es la hoja con estado: guarda el contenido de la cola, el historial
 * para "Regresar" y el modal abierto. Toda la logica de la estructura
 * vive en `@/app/estructuras/services/cola`; este componente solo la
 * orquesta y la muestra.
 */
export function ColaSection({ data }: { data: ColaViewData }) {
  const { title, paragraph, labels, buttons, modal: modalText, errors } = data;

  const [cola, setCola] = useState<Cola>(crearCola);
  const [historial, setHistorial] = useState<HistorialCola>({ estados: [] });
  const [modalAbierto, setModalAbierto] = useState<ModalCola>(null);
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
  const mostrarError = (error: ErrorCola) => {
    setErrorMensaje(errors[error]);
    setModalAbierto("error");
  };

  /**
   * Aplica una operacion que cambia la cola: guarda el estado actual en
   * el historial y actualiza la cola.
   */
  const aplicar = (nuevaCola: Cola) => {
    setHistorial((hist) => registrarEstado(hist, cola));
    setCola(nuevaCola);
  };

  // ---------------------------------------------------------------------------
  // OPERACIONES
  // ---------------------------------------------------------------------------

  /** INSERTAR: agrega un valor al FINAL desde el modal de insercion. */
  const confirmarInsercion = () => {
    const texto = valorInsercion.trim();

    if (!/^\d+$/.test(texto)) {
      mostrarError("VALOR_INVALIDO");
      return;
    }

    const resultado = insertar(cola, Number(texto));
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor);
    cerrarModal();
  };

  /** ELIMINAR: saca el valor del FRENTE (con confirmacion previa). */
  const confirmarEliminacion = () => {
    const resultado = eliminar(cola);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor.cola);
    cerrarModal();
  };

  /** EDICION COMPLETA: arma la cola desde la lista de valores. */
  const confirmarEdicion = () => {
    const partes = valoresEdicion
      .split(",")
      .map((parte) => parte.trim())
      .filter((parte) => parte.length > 0);

    const numeros = partes.map((parte) =>
      /^\d+$/.test(parte) ? Number(parte) : Number.NaN,
    );

    const resultado = editarCola(numeros);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor);
    cerrarModal();
  };

  /** REGRESAR: vuelve al estado anterior de la cola. */
  const handleRegresar = () => {
    const resultado = regresar(historial);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    setCola(resultado.valor.cola);
    setHistorial(resultado.valor.historial);
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const valoresActuales = valoresCola(cola);

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Titulo y bajada de la seccion */}
      <div className="flex flex-col gap-3">
        <Title2 txt={title} />
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-left">
          {paragraph}
        </p>
      </div>

      {/* Representacion grafica de la cola */}
      <ColaVisualizer cola={cola} labels={labels} />

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
        <FieldInput
          id="valor-insercion-cola"
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
        <FieldInput
          id="valores-edicion-cola"
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
        title={title}
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

      {/* Contenido actual, de FRENTE a FINAL */}
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
