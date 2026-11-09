// middleware.ts — Next.js middleware (raíz del proyecto)
// Refresca la sesion de Supabase en cada request para que el token no expire.
import type { NextRequest } from "next/server";
import { updateSession } from "@/services/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
