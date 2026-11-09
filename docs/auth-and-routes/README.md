---

type: guide
status: active
created: 2026-11-09
tags: [auth, supabase, routes, admin, oauth]
---

# Auth y rutas

El flujo de login, el callback de OAuth, el route group protegido por rol y el
middleware que refresca la sesion.

---

## Mapa de las rutas

```
src/app/
├── page.tsx                  ← landing publica
├── layout.tsx                ← layout raiz
├── loading.tsx, error.tsx    ← estados de carga y error
├── login/
│   └── page.tsx              ← login (email + Google OAuth)
├── auth/
│   ├── callback/
│   │   └── route.ts          ← Route Handler: exchangeCodeForSession
│   └── route/
│       └── page.tsx          ← post-login: admin → /admin, si no → /
└── (admin)/
    ├── layout.tsx            ← guard: sesion + profiles.role === "admin"
    └── admin/
        └── page.tsx          ← placeholder del panel
```

El route group `(admin)` **no aparece en la URL**: `(admin)/admin/page.tsx`
sirve en `/admin`. Los parentesis solo organizan las carpetas.

### Que hace cada archivo

| Archivo                               | Tipo             | Que hace                                  |
| ------------------------------------- | ---------------- | ----------------------------------------- |
| `login/page.tsx`                      | Client Component | El formulario de login                    |
| `auth/callback/route.ts`              | Route Handler    | Canjea el codigo de OAuth por una sesion  |
| `auth/route/page.tsx`                 | Server Component | Decide a donde va el usuario segun su rol |
| `(admin)/layout.tsx`                  | Server Component | El guard de rol                           |
| `(admin)/admin/page.tsx`              | Server Component | Placeholder del panel                     |
| `middleware.ts` (raiz)                | Middleware       | Llama a `updateSession` en cada request   |
| `src/services/supabase/middleware.ts` | Middleware       | Refresca la sesion de Supabase            |

---

## El flujo completo

### Google OAuth (el flujo que tiene el codigo escrito)

```
1. Usuario clickea "Continuar con Google"   (login/page.tsx)
        │
        │ supabase.auth.signInWithOAuth({
        │   provider: "google",
        │   options: { redirectTo: `${getSiteURL()}/auth/callback` }
        │ })
        ▼
2. Supabase redirige al proveedor de Google
        │
        ▼
3. Google autentica y redirige a <site>/auth/callback?code=XXXX
        │
        ▼
4. auth/callback/route.ts (GET)
        │   supabase.auth.exchangeCodeForSession(code)
        │   → si ok: NextResponse.redirect(`${origin}${next}`)
        │   → si falla: redirect a /login?error=auth_callback_failed
        ▼
5. El usuario llega a / con la sesion en cookies
        │
        ▼
6. Si en algun momento entra a /admin, el guard de (admin)/layout.tsx
   decide si puede quedarse o lo rebota
```

**Verificado**: `auth/callback/route.ts` es un `GET` que lee el parametro
`code` de la query string, llama a `exchangeCodeForSession` y redirige.

### Login por email

```
1. Usuario completa email + password  (login/page.tsx)
        │   react-hook-form + zodResolver
        │   supabase.auth.signInWithPassword({ email, password })
        ▼
2. Si hay error → se muestra en el formulario
   Si hay exito → router.push("/") + router.refresh()
```

Ojo: el login por email **redirige directo a `/`**, no pasa por
`/auth/route`. Es decir, el chequeo de rol no se ejecuta en este camino: un
admin que entra por email tampoco llega a `/admin` automaticamente.

### El route post-login (`/auth/route`)

`src/app/auth/route/page.tsx` es la pagina que decide a donde va el usuario
segun su rol:

```tsx
if (!isSupabaseConfigured()) redirect("/");

const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) redirect("/login");

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .maybeSingle();

if (profile?.role === "admin") redirect("/admin");

redirect("/");
```

| Situacion                   | Destino  |
| --------------------------- | -------- |
| Supabase no configurado     | `/`      |
| Sin sesion                  | `/login` |
| `profiles.role === "admin"` | `/admin` |
| Rol `client` (o sin perfil) | `/`      |

> **Ojo con el nombre de la ruta**: `/auth/route` no es una ruta "de auth" en
> el sentido de "autenticacion": es la pagina de **destino** post-login. El
> nombre es confuso (viene de una migracion), pero es la ruta que hay que
> usar como destino del callback.
>
> **Ademas, el callback no la usa.** `auth/callback/route.ts` redirige a
> `${origin}${next}`, y `next` sale del parametro `?next=` de la query
> string, con default `"/"`. O sea: **el flujo de OAuth nunca llega a
> `/auth/route` salvo que se lo pida explicitamente** con
> `?next=/auth/route`.
>
> Verificado: no hay ningun `redirectTo` ni enlace en el codigo que apunte a
> `/auth/route`. La pagina existe y funciona, pero esta desconectada del
> flujo por defecto. Si un proyecto quiere que el callback termine ahi, hay
> que cambiar el `redirectTo` del login o pasar `?next=/auth/route`.

---

## El guard de rol

`src/app/(admin)/layout.tsx` protege todo lo que hay dentro del route group
`(admin)`.

```tsx
export default async function AdminLayout({ children }: LayoutProps) {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  return (
    <>
      <header>...</header>
      {children}
    </>
  );
}
```

Cuatro cortes, en orden:

| #   | Condicion                   | Resultado            |
| --- | --------------------------- | -------------------- |
| 1   | Supabase no configurado     | `redirect("/")`      |
| 2   | Sin sesion (`user` es null) | `redirect("/login")` |
| 3   | `profile.role !== "admin"`  | `redirect("/")`      |
| 4   | Todo ok                     | Renderiza el panel   |

El rol sale de la tabla **`profiles`**, no de `auth.users`. El campo es
`profiles.role`, con default `'client'`.

### El perfil se crea solo

El trigger `handle_new_user` de `setup-database.sql` crea la fila de
`profiles` cuando el usuario se registra, con `role = 'client'`.

Para darle permisos de admin a alguien:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

El trigger **nunca** asigna `admin` automaticamente. Es deliberado.

### El rol es un string, no un enum

`profiles.role` es `TEXT DEFAULT 'client'`. Los valores que usa el template
son `"admin"` y `"client"`. Si el proyecto agrega mas roles, la tabla no los
conoce: hay que actualizar el check del guard.

### Lectura de `profiles` y RLS

La tabla `profiles` tiene `public_read_access` (SELECT USING true), asi que
la consulta del guard funciona con la publishable key. Ojo: eso tambien
significa que **cualquiera puede leer el `email` de todos los perfiles**
mientras la sesion no este autenticada. Ver la nota en
`docs/setup-database.md`.

---

## El middleware: refresco de sesion

### `middleware.ts` (raiz del proyecto)

```ts
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

El matcher excluye los assets estaticos: el middleware no corre para ellos.

### `src/services/supabase/middleware.ts`

```ts
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          for (const { name, value } of cookiesToSet)
            request.cookies.set(name, value);
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
```

Que hace, en orden:

1. **Si no hay credenciales**, devuelve la respuesta tal cual: en modo
   estatico no hay sesion que refrescar.
2. **Crea un cliente de Supabase** que lee y escribe cookies del request.
3. **`await supabase.auth.getUser()`**: la llamada que refresca el token si
   esta por expirar. Si Supabase decide que hace falta un token nuevo, el
   `setAll` lo escribe en la respuesta.
4. **Devuelve la respuesta con las cookies actualizadas**.

### Por que hace falta

El token de sesion de Supabase expira. Sin este middleware, el usuario
navega, el token expira, y la proxima llamada a un Server Component que
pida el usuario falla con "not authenticated" aunque el usuario haya iniciado
sesion hace 5 minutos.

Es el unico punto donde la sesion se refresca de forma proactiva.

### Los tres clientes de Supabase

| Archivo                               | Para que sirve                     | Usa cookies          |
| ------------------------------------- | ---------------------------------- | -------------------- |
| `src/services/supabase/client.ts`     | Client Components (navegador)      | No                   |
| `src/services/supabase/server.ts`     | Server Components y Route Handlers | Si (`cookies()`)     |
| `src/services/supabase/middleware.ts` | Refresco de sesion en cada request | Si (request.cookies) |

Los tres estan tipados con `Database` de
`src/services/supabase/types/types.ts`.

---

## Que se necesita para que funcione

### 1. Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` la usa `getSiteURL()` (`src/services/site-url.ts`) para
construir el `redirectTo` del OAuth. Sin ella, el default es
`http://localhost:3000`.

### 2. La base de datos

Correr `setup-database.sql` (crea `profiles`, el trigger y las policies).
Ver `docs/setup-database.md`.

### 3. Configuracion en el Supabase Dashboard

**Authentication → Providers → Google**: habilitar el proveedor y poner el
Client ID y el Client Secret de Google Cloud.

**Authentication → URL Configuration → Redirect URLs**: agregar

```
http://localhost:3000/auth/callback
https://tu-dominio.com/auth/callback
```

La URL tiene que coincidir **exactamente** con el `redirectTo` que arma el
login (`${getSiteURL()}/auth/callback`). Si no coincide, Supabase rechaza el
callback con un error de redirect.

**Authentication → URL Configuration → Site URL**: la URL base del sitio
(produccion).

### 4. Dar de alta al primer admin

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

---

## Trampa importante: los placeholders del `.env.example`

El `.env.example` trae valores placeholder **no vacios**:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Si el proyecto hace `cp .env.example .env.local` y no los edita,
`isSupabaseConfigured()` devuelve **true** (comprueba que las cadenas no
esten vacias, no que sean validas). Con eso:

- El guard de `(admin)/layout.tsx` **no** corta en el paso 1.
- Intenta crear el cliente de Supabase con una URL invalida.
- `createServerClient` tira `Invalid supabaseUrl: Must be a valid HTTP or
  HTTPS URL.`
- La excepcion la agarra `src/app/error.tsx` y el usuario ve la pantalla de
  error en vez de un redirect limpio.

**Verificado en el navegador**, con el `.env.local` copiado del
`.env.example`:

```
/admin        -> 200, pantalla de error ("Hubo un problema al cargar los datos")
/auth/route   -> 200, pantalla de error
/login        -> 200, el boton de Google HABILITADO (porque "hay credenciales")
```

Y con las variables **vacias**:

```
/admin        -> redirect a /
/auth/route   -> redirect a /
/login        -> 200, el boton de Google deshabilitado
```

**La solucion**: dejar las variables de Supabase **vacias** (no con
placeholders) hasta tener las credenciales reales. O borrar las lineas del
todo: `isSupabaseConfigured()` devuelve false y el template arranca en modo
estatico, que es lo que se quiere.

El error real aparece en la consola del servidor:

```
⨯ Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
    at createClient (src/services/supabase/server.ts:13:28)
    at async AdminLayout (src/app/(admin)/layout.tsx:24:20)
```

---

## Otras trampas

### El login expone el mensaje del error de Supabase

`login/page.tsx` hace:

```tsx
if (authError) setError(authError.message);
```

El mensaje crudo de Supabase se muestra al usuario. Para errores de
autenticacion no filtra nada sensible, pero es inconsistente con la regla del
proyecto de **no exponer mensajes crudos al usuario** (`.hermes.md`: nunca
exponer `error.message`, puede filtrar SQL o paths). Si el proyecto lo
cambia, es una decision del proyecto: aca esta el comportamiento actual.

### El boton de Google se deshabilita solo si no hay credenciales

```tsx
const supabaseConfigured = isSupabaseConfigured();
...
disabled={!supabaseConfigured}
```

Con los placeholders del `.env.example`, el boton queda **habilitado** y el
click falla con un error de red. Ver la trampa de arriba.

### El `login` no distingue "no hay sesion" de "sesion invalida"

Si el usuario ya tiene sesion y entra a `/login`, ve el formulario. No hay
redireccion automatica al panel.

### El panel admin es un placeholder

`(admin)/admin/page.tsx` es un placeholder. El guard y el layout del panel
existen y funcionan; el contenido del panel no.

### Si el proyecto no usa auth

Se puede borrar el auth entero:

- `src/app/login/`
- `src/app/auth/`
- `src/app/(admin)/`
- `src/services/supabase/`
- `middleware.ts` (raiz)

Es la respuesta a la pregunta inicial 4 ("¿Tiene autenticación o panel de
administración?").

---

## Verificacion

```bash
# El sitio publico responde
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/

# El guard de admin redirige (con credenciales vacias -> 307 a /)
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' http://localhost:3000/admin

# El login renderiza
curl -s http://localhost:3000/login | grep -c 'Continuar con Google'
```

En el navegador:

1. `/login` renderiza el formulario.
2. Sin credenciales de Supabase, el boton de Google esta deshabilitado y el
   login por email muestra "Supabase no esta configurado. Revisa tu
   .env.local."
3. `/admin` redirige a `/` (sin credenciales) o muestra la pantalla de error
   (con placeholders no vacios).
4. Con credenciales reales: el login con Google vuelve al sitio con la
   sesion activa, y `/admin` entra si el rol es `admin`.

---

## Archivos

| Archivo                                | Rol                                        |
| -------------------------------------- | ------------------------------------------ |
| `src/app/login/page.tsx`               | Formulario (RHF + Zod) + OAuth             |
| `src/app/auth/callback/route.ts`       | `exchangeCodeForSession`                   |
| `src/app/auth/route/page.tsx`          | Destino post-login segun rol               |
| `src/app/(admin)/layout.tsx`           | Guard de rol                               |
| `src/app/(admin)/admin/page.tsx`       | Placeholder del panel                      |
| `middleware.ts`                        | Entry point del middleware                 |
| `src/services/supabase/middleware.ts`  | Refresco de sesion                         |
| `src/services/supabase/client.ts`      | Cliente de navegador                       |
| `src/services/supabase/server.ts`      | Cliente de servidor                        |
| `src/services/supabase/types/types.ts` | Tipos generados                            |
| `src/services/env.ts`                  | `isSupabaseConfigured()`, `supabaseEnv`    |
| `src/services/site-url.ts`             | `getSiteURL()` para los redirects de OAuth |
| `setup-database.sql`                   | La tabla `profiles` y el trigger           |
| `docs/setup-database.md`               | El paso a paso del setup                   |
