import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseEnv } from "@/services/env";
import type { Database } from "./types/types";

/**
 * Middleware de Next.js: refresca la sesion de Supabase en cada request.
 * Sin esto, el token de sesion puede expirar mientras el usuario navega.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Sin credenciales validas no hay sesion que refrescar (modo estatico).
  // El guard valida el FORMATO de la URL: un .env.local copiado del
  // .env.example tiene placeholders que existen pero no son una URL valida,
  // y createServerClient revienta con "Invalid supabaseUrl" en cada request.
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseEnv.url,
    supabaseEnv.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}
