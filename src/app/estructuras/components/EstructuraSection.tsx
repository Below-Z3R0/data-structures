"use client";

import { AlertTriangle, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { FieldInput } from "@/components/atoms/FieldInput";
import { Title2 } from "@/components/atoms/Title2";
import { Modal } from "@/components/molecules/Modal";

/** Resultado normalizado: cada service devuelve una forma distinta. */
export type ResultadoEstructura<T> =
  | { ok: true; valor: { estado: T; item?: number } }
  | { ok: false; error: string };

/** Contrato que cada estructura implementa sobre su service. */
export interface EstructuraAdapter<T, H extends { estados: unknown[] }> {
  /** Estado inicial de la estructura. */
  crear: () => T;
  /** Historial vacio de la estructura. */
  historialVacio: () => H;
  /** Valores actuales, en el orden de lectura de la estructura. */
  valores: (estado: T) => number[];
  insertar: (estado: T, valor: number) => ResultadoEstructura<T>;
  eliminar: (estado: T) => ResultadoEstructura<T>;
  editar: (valores: number[]) => ResultadoEstructura<T>;
  regresar: (historial: H) => ResultadoEstructura<T> & { historial?: H };
  registrar: (historial: H, estado: T) => H;
  /** Id estable para los inputs y los data-testid. */
  idPrefix: string;
}

/** Textos que consume el generico; cada ViewData los cumple. */
export interface EstructuraViewData {
  title: string;
  paragraph: string;
  labels: { error: string };
  buttons: {
    insertar: string;
    eliminar: string;
    regresar: string;
    editar: string;
  };
  modal: {
    insertar_titulo: string;
    insertar_label: string;
    insertar_placeholder: string;
    eliminar_titulo: string;
    eliminar_mensaje: string;
    editar_titulo: string;
    editar_label: string;
    editar_placeholder: string;
    cancelar: string;
    confirmar: string;
    aceptar: string;
  };
  errors: Record<string, string>;
}

/** Modales posibles de la seccion. */
type ModalAbierto = "insertar" | "eliminar" | "editar" | "error" | null;

/** Seccion generica de una estructura: estado, historial y los cuatro modales. */
export function EstructuraSection<T, H extends { estados: unknown[] }>({
  data,
  adapter,
  visualizer,
}: {
  data: EstructuraViewData;
  adapter: EstructuraAdapter<T, H>;
  visualizer: (estado: T) => ReactNode;
}) {
  const { title, paragraph, buttons, modal: modalText } = data;
  const { idPrefix } = adapter;

  const [estado, setEstado] = useState<T>(adapter.crear);
  const [historial, setHistorial] = useState<H>(adapter.historialVacio);
  const [modalAbierto, setModalAbierto] = useState<ModalAbierto>(null);
  const [errorMensaje, setErrorMensaje] = useState<string>("");

  // Valores de los formularios de los modales.
  const [valorInsercion, setValorInsercion] = useState("");
  const [valoresEdicion, setValoresEdicion] = useState("");

  // Cierra el modal y limpia los formularios.
  const cerrarModal = () => {
    setModalAbierto(null);
    setValorInsercion("");
    setValoresEdicion("");
  };

  // Muestra el modal de error con el mensaje del codigo.
  const mostrarError = (error: string) => {
    setErrorMensaje(data.errors[error] ?? "");
    setModalAbierto("error");
  };

  // Aplica una operacion: guarda el estado previo y actualiza.
  const aplicar = (nuevoEstado: T) => {
    setHistorial((hist) => adapter.registrar(hist, estado));
    setEstado(nuevoEstado);
  };

  // Inserta un valor desde el modal de insercion.
  const confirmarInsercion = () => {
    const texto = valorInsercion.trim();

    if (!/^\d+$/.test(texto)) {
      mostrarError("VALOR_INVALIDO");
      return;
    }

    const resultado = adapter.insertar(estado, Number(texto));
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor.estado);
    cerrarModal();
  };

  // Elimina un elemento (con confirmacion previa).
  const confirmarEliminacion = () => {
    const resultado = adapter.eliminar(estado);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor.estado);
    cerrarModal();
  };

  // Reemplaza el contenido completo con la lista de valores.
  const confirmarEdicion = () => {
    const numeros = valoresEdicion
      .split(",")
      .map((parte) => parte.trim())
      .filter((parte) => parte.length > 0)
      .map((parte) => (/^\d+$/.test(parte) ? Number(parte) : Number.NaN));

    const resultado = adapter.editar(numeros);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    aplicar(resultado.valor.estado);
    cerrarModal();
  };

  // Vuelve al estado anterior del historial.
  const handleRegresar = () => {
    const resultado = adapter.regresar(historial);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      return;
    }

    setEstado(resultado.valor.estado);
    if (resultado.historial) setHistorial(resultado.historial);
  };

  const valoresActuales = adapter.valores(estado);

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Titulo y bajada de la seccion */}
      <div className="flex flex-col gap-3">
        <Title2 txt={title} />
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-left">
          {paragraph}
        </p>
      </div>

      {/* Representacion grafica de la estructura */}
      {visualizer(estado)}

      {/* Botones de operacion */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => setModalAbierto("insertar")}
          data-testid={`${idPrefix}-insertar`}
          icon={<Plus className="size-4" />}
          txt={buttons.insertar}
          buttonBody="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          txtStyle="text-primary-foreground!"
        />

        <Button
          onClick={() => setModalAbierto("eliminar")}
          data-testid={`${idPrefix}-eliminar`}
          icon={<Trash2 className="size-4" />}
          txt={buttons.eliminar}
          buttonBody="h-11 px-6 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-hover hover:border-destructive active:scale-95 transition-all"
        />

        <Button
          onClick={handleRegresar}
          data-testid={`${idPrefix}-regresar`}
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
          data-testid={`${idPrefix}-editar`}
          icon={<Pencil className="size-4" />}
          txt={buttons.editar}
          buttonBody="h-11 px-6 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-hover active:scale-95 transition-all"
        />
      </div>

      {/* Insertar un valor */}
      <Modal
        open={modalAbierto === "insertar"}
        onClose={cerrarModal}
        title={modalText.insertar_titulo}
        footer={
          <>
            <Button
              onClick={cerrarModal}
              data-testid={`${idPrefix}-cancelar`}
              txt={modalText.cancelar}
              buttonBody="h-10 px-5 rounded-lg bg-popover border border-border text-foreground font-medium hover:bg-hover transition-all"
            />
            <Button
              onClick={confirmarInsercion}
              data-testid={`${idPrefix}-aceptar`}
              txt={modalText.aceptar}
              buttonBody="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
              txtStyle="text-primary-foreground!"
            />
          </>
        }
      >
        <FieldInput
          id={`${idPrefix}-valor-insercion`}
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
              data-testid={`${idPrefix}-cancelar`}
              txt={modalText.cancelar}
              buttonBody="h-10 px-5 rounded-lg bg-popover border border-border text-foreground font-medium hover:bg-hover transition-all"
            />
            <Button
              onClick={confirmarEliminacion}
              data-testid={`${idPrefix}-confirmar`}
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
              data-testid={`${idPrefix}-cancelar`}
              txt={modalText.cancelar}
              buttonBody="h-10 px-5 rounded-lg bg-popover border border-border text-foreground font-medium hover:bg-hover transition-all"
            />
            <Button
              onClick={confirmarEdicion}
              data-testid={`${idPrefix}-confirmar`}
              txt={modalText.confirmar}
              buttonBody="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
              txtStyle="text-primary-foreground!"
            />
          </>
        }
      >
        <FieldInput
          id={`${idPrefix}-valores-edicion`}
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
        title={data.labels.error}
        variant="danger"
        footer={
          <Button
            onClick={cerrarModal}
            data-testid={`${idPrefix}-aceptar`}
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
