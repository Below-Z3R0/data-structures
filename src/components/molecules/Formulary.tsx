"use client";
import emailjs from "@emailjs/browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { emailJsEnv } from "@/services/env";
import { LoadingDots } from "../animations/animationsindex";
import {
  Button,
  ErrorMessage,
  Span,
  SuccessMessage,
  Title4,
} from "../components";
import { type SendEmail, SendEmailSchema } from "../schemas";
import type { FormStatus, FormularyProps } from "../types";

export function Formulary({
  form_data,
  bodyStyle,
  labelStyle,
  inputStyle,
}: FormularyProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const closeModal = () => {
    setStatus("idle");
    setErrorMsg("");
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendEmail>({
    resolver: zodResolver(SendEmailSchema),
    mode: "onChange",
    defaultValues: { name: "", user_email: "", title: "", message: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await emailjs.send(
        emailJsEnv.serviceId,
        emailJsEnv.templateId,
        {
          from_name: data.name,
          reply_to: data.user_email,
          title: data.title,
          message: data.message,
        },
        { publicKey: emailJsEnv.publicKey },
      );

      setStatus("success");
      reset();
    } catch (err) {
      const e = err as Record<string, unknown>;
      console.error(
        "EmailJS error:",
        JSON.stringify(e, Object.getOwnPropertyNames(e || {}), 2),
      );
      console.error("Error keys:", e && Object.keys(e));
      console.error("Error status:", e && (e.status || e.code));
      console.error("Error text:", e && (e.text || e.message));
      const errorMessage =
        typeof e?.text === "string"
          ? e.text
          : typeof e?.message === "string"
            ? e.message
            : "Error desconocido al enviar el mensaje";
      setErrorMsg(errorMessage);
      setStatus("error");
    }
  });
  return (
    <>
      <form
        noValidate
        onSubmit={onSubmit}
        className={`${bodyStyle} rounded-3xl size-full flex flex-col p-[5%] bg-card border border-border items-start shadow-2xl relative overflow-hidden`}
      >
        <div className="relative w-full">
          <Title4
            txt={form_data.title}
            className="pb-[2%] text-foreground font-bold tracking-tight text-lg"
          />

          {form_data.top.map((field) => (
            <label
              key={field.name}
              className={`${labelStyle} w-full rounded-xl flex flex-col items-start mb-[2%] text-sm font-medium text-muted-foreground gap-2`}
            >
              {field.label}
              <input
                required
                type={field.type}
                placeholder={field.placeholder}
                disabled={isSubmitting}
                className={`${inputStyle} w-full rounded-md flex p-[2%] bg-popover placeholder:text-muted-foreground/30 focus:border-primary transition-all disabled:opacity-50`}
                {...register(field.name as keyof SendEmail)}
              />

              {errors[field.name as keyof SendEmail] && (
                <Span
                  id={`${field.name}-error`}
                  txt={errors[field.name as keyof SendEmail]?.message}
                  role="alert"
                  className="text-destructive text-xs"
                />
              )}
            </label>
          ))}

          <label className="w-full flex flex-col items-start gap-2 text-sm font-medium text-muted-foreground">
            {form_data.bottom.label}

            <textarea
              required
              placeholder={form_data.bottom.placeholder}
              disabled={isSubmitting}
              className="w-full rounded-xl p-4 bg-popover placeholder:text-muted-foreground/30 focus:border-primary outline-none min-h-40 transition-colors resize-none disabled:opacity-50"
              {...register(form_data.bottom.name as keyof SendEmail)}
            />

            {errors[form_data.bottom.name as keyof SendEmail] && (
              <Span
                id={`${form_data.bottom.name}-error`}
                txt={errors[form_data.bottom.name as keyof SendEmail]?.message}
                role="alert"
                className="text-destructive text-xs"
              />
            )}
          </label>

          <div className="flex items-center justify-center w-full">
            <Button
              type="submit"
              disabled={isSubmitting}
              buttonBody={`w-7/12 p-[2%] mt-[3%] rounded-md bg-primary font-bold transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.2)] ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:opacity-90 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Span txt={form_data.sending} />
                  <LoadingDots isLoading={isSubmitting} />
                </>
              ) : (
                <Span txt={form_data.send} />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Mensaje de éxito animado */}
      <SuccessMessage show={status === "success"} onClose={closeModal} />

      {/* Mensaje de error animado */}
      <ErrorMessage
        show={status === "error"}
        onClose={closeModal}
        onRetry={() => {
          setErrorMsg("");
        }}
        message={errorMsg}
      />
    </>
  );
}
