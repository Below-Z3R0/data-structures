// ============================================
// auth/route/page.tsx
// ============================================
// Pagina post-login: si el usuario es admin, redirige al admin.
// Si no, redirige al home. Si no hay sesion, redirige al login.

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/services/env";
import { createClient } from "@/services/supabase/server";

export default async function AuthRoutePage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirect("/");
}
