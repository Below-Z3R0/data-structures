/**
 * Acceso tipado y validado a variables de entorno.
 *
 * Por que NO usamos `process.env[name]` (acceso dinamico):
 * Next.js solo puede inlinear en el bundle del cliente las variables con
 * prefijo `NEXT_PUBLIC_` cuando el acceso es ESTATICO (`process.env.FOO`).
 * Con un indice dinamico (`process.env[name]`) el bundler no puede resolverlo,
 * el objeto `process.env` queda vacio en el navegador y la variable llega
 * como `undefined` en runtime.
 *
 * Por eso cada getter accede a su variable de forma estatica: asi Next.js
 * reemplaza la referencia por el valor literal durante el build.
 *
 * Los getters (y no constantes) hacen que el error aparezca en el momento del
 * uso, no al importar el modulo.
 */

/** Error lanzo cuando falta una variable de entorno requerida. */
export class MissingEnvError extends Error {
  constructor(name: string) {
    super(
      `[env] Falta la variable de entorno "${name}". ` +
        `Revisá tu .env.local o las variables configuradas en Vercel.`,
    );
    this.name = "MissingEnvError";
  }
}

/**
 * Valida que una variable de entorno requerida tenga valor.
 *
 * @param name - Nombre de la variable, solo para el mensaje de error.
 * @param value - Valor leido de `process.env` (acceso estatico en el llamador).
 * @returns El valor, garantizado como string no vacio.
 */
function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new MissingEnvError(name);
  }
  return value;
}

/** URLs y claves de Supabase, resueltas en el momento de uso. */
export const supabaseEnv = {
  get url(): string {
    return ensure(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },
  get publishableKey(): string {
    return ensure(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
};

/**
 * Indica si hay credenciales de Supabase realmente configuradas.
 * Permite que el template funcione (en modo estatico) sin .env.local.
 *
 * No alcanza con que la variable exista: el `.env.example` viene con
 * placeholders (`your-project-url`) y un `.env.local` copiado sin editar
 * tiene valores que existen pero no son validos. Validamos el formato de
 * la URL para no intentar conectar contra un placeholder.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return false;
  }
  // Placeholder del .env.example o URL mal formada.
  if (url.startsWith("your-")) {
    return false;
  }
  return /^https?:\/\/.+\.supabase\.(co|in)/.test(url);
}

/** Credenciales de EmailJS usadas por el formulario de contacto. */
export const emailJsEnv = {
  get serviceId(): string {
    return ensure(
      "NEXT_PUBLIC_EMAILJS_SERVICE_ID",
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    );
  },
  get templateId(): string {
    return ensure(
      "NEXT_PUBLIC_EMAILJS_TEMPLATE_ID",
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    );
  },
  get publicKey(): string {
    return ensure(
      "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY",
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    );
  },
};

/** Origen de datos del sitio. Se resuelve en el servidor. */
export type DataSource = "supabase" | "static";

/**
 * Resuelve el origen de datos del sitio.
 *
 * - `DATA_SOURCE=static` o `DATA_SOURCE=supabase` fuerza el modo.
 * - Sin `DATA_SOURCE`, se usa Supabase solo si hay credenciales cargadas;
 *   si no, el template arranca con los JSON estaticos de ejemplo.
 */
export function resolveDataSource(): DataSource {
  const configured = process.env.DATA_SOURCE;
  if (configured === "static" || configured === "supabase") {
    return configured;
  }
  return isSupabaseConfigured() ? "supabase" : "static";
}
