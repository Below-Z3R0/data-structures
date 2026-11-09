// ============================================
// login/page.tsx - Client Component
// ============================================
// Pagina de login con Supabase Auth (email + Google OAuth).
// Usa react-hook-form + zod para validacion.
//
// Si el proyecto no usa autenticacion, se puede borrar esta carpeta junto
// con (admin)/ y src/services/supabase/.

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isSupabaseConfigured } from "@/services/env";
import { getSiteURL } from "@/services/site-url";
import { createClient } from "@/services/supabase/client";

/* ================================================================
   SCHEMAS
   ================================================================ */
const signInSchema = z.object({
  email: z.email({ message: "Formato de correo invalido" }),
  password: z.string().min(6, { message: "Minimo 6 caracteres" }),
});

type SignIn = z.infer<typeof signInSchema>;

/* ================================================================
   ICONOS (inline para no depender de una libreria de iconos)
   ================================================================ */
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>MailIcon</title>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>LockIcon</title>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>ArrowRightIcon</title>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const LoaderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>LoaderIcon</title>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/* ================================================================
   COMPONENTE
   ================================================================ */
export default function LoginPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignIn>({
    mode: "onChange",
    resolver: zodResolver(signInSchema),
  });

  /* ---- Handlers ---- */
  const handleGoogleLogin = async () => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteURL()}/auth/callback`,
      },
    });
  };

  const handleEmailSignIn = async (formData: SignIn) => {
    setLoading(true);
    setError(null);

    if (!supabaseConfigured) {
      setError("Supabase no esta configurado. Revisa tu .env.local.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      router.push("/");
      router.refresh();
    }

    setLoading(false);
  };

  /* ---- Render ---- */
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            Iniciar sesion
          </h1>
          <p className="text-sm text-muted-foreground">Accede a tu cuenta</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-xl shadow-lg p-6">
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={!supabaseConfigured}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-border rounded-md bg-background hover:bg-hover transition-colors text-sm font-medium text-foreground mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <title>Google</title>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              o
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive text-center mb-3">{error}</p>
          )}

          {/* Form */}
          <form
            className="flex flex-col gap-3.5"
            onSubmit={handleSubmit(handleEmailSignIn)}
          >
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <input
                type="email"
                placeholder="Correo electronico"
                className="w-full bg-transparent appearance-none border border-border rounded-md pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <input
                type="password"
                placeholder="Contrasena"
                className="w-full bg-transparent appearance-none border border-border rounded-md pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-sm font-medium rounded-md transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesion
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
