import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseEnv } from "@/services/env";
import type { Database } from "./types/types";

/**
 * Middleware de Next.js: refresca la sesion de Supabase en cada request.
 * Sin esto, el token de sesion puede expirar mientras el usuario navega.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Sin credenciales cargadas no hay sesion que refrescar (modo estatico).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
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
