// ============================================
// (admin)/layout.tsx - Layout del panel admin
// ============================================
// Protege las rutas admin: redirige al login si no hay sesion,
// o al home si el usuario no tiene rol admin.
//
// La sesion se lee con el cliente de servidor de Supabase (@supabase/ssr),
// que refresca las cookies en cada request.

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/services/env";
import { createClient } from "@/services/supabase/server";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  // Sin Supabase configurado no hay panel admin que proteger.
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

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 py-3 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-241.5 mx-auto px-5 flex items-center justify-between">
          <a
            href="/admin"
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Admin Panel
          </a>
          <a
            href="/"
            target="_blank"
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-hover px-3 py-2 rounded-md transition-all"
            rel="noopener"
          >
            Ver sitio publico
          </a>
        </div>
      </header>
      {children}
    </>
  );
}
