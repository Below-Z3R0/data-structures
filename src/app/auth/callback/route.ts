// ============================================
// auth/callback/route.ts - OAuth callback
// ============================================
// Supabase redirige aqui despues del login con Google.
// Intercambia el codigo por una sesion y redirige al home.

import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/services/env";
import { createClient } from "@/services/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Error: redirigir al login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
