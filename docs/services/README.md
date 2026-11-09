# Services

Capa de acceso a datos externos. Los componentes no hablan con Supabase ni con
el sistema de archivos: pasan por aca.

## Archivos

| Archivo                                        | Rol                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `src/services/env.ts`                          | Acceso tipado a variables de entorno + switch de origen de datos |
| `src/services/data/site.ts`                    | Orquestador de datos del sitio                                   |
| `src/services/data/static/`                    | Payloads JSON del modo estatico                                  |
| `src/services/assets/Icons.tsx`                | Iconos SVG inline                                                |
| `src/services/assets/icon-registry.ts`         | Registro de iconos + schema Zod de las keys                      |
| `src/services/assets/supabase-image-loader.ts` | Loader de imagenes de Supabase Storage                           |
| `src/services/supabase/client.ts`              | Cliente de Supabase para el navegador                            |
| `src/services/supabase/server.ts`              | Cliente de Supabase para servidor                                |
| `src/services/supabase/middleware.ts`          | Refresco de sesion                                               |
| `src/services/supabase/types/types.ts`         | Tipos generados de Supabase                                      |
| `src/services/site-url.ts`                     | URL base del sitio                                               |

## Acceso a variables de entorno

Regla critica: **acceso estatico, nunca indexado**.

```ts
// Bien: Next.js puede inlinear el valor en el bundle
get url() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

// Mal: el bundler no puede resolverlo, llega undefined en el navegador
process.env[name];
```

Con `NEXT_PUBLIC_` + acceso indexado, `process.env` queda vacio en el cliente
y la variable llega como `undefined` en runtime.

Por eso `env.ts` expone **getters** y no constantes: el error aparece en el
momento del uso, no al importar el modulo.

## Iconos

Los iconos son SVG inline en `src/services/assets/Icons.tsx`, registrados en
`icon-registry.ts`:

```ts
export const ICON_REGISTRY = {
  react: ReactIcon,
  typescript: TypeScriptIcon,
  // ...
} as const satisfies Record<string, IconComponent>;

export const IconNameSchema = z.string().refine((val) => val in ICON_REGISTRY, {
  message: "Debe ser una key del registry (react, docker...)",
});
```

`IconNameSchema` es parte del contrato de datos: los JSON de ejemplo no
pueden referring una key de icono que no exista.

Para agregar un icono: escribir el SVG en `Icons.tsx`, registrarlo en
`icon-registry.ts`. El schema Zod lo valida automaticamente.

## Supabase

- `client.ts` es para Client Components (navegador).
- `server.ts` es para Server Components y Route Handlers. Usa `cookies()`.
- `middleware.ts` refresca la sesion en cada request. Sin esto, el token
  expira mientras el usuario navega.

Los tres estan tipados con `Database` de `src/services/supabase/types/types.ts`.
Para regenerar los tipos:

```bash
bunx supabase gen types typescript --project-id <PROJECT_ID> \
  --schema public > src/services/supabase/types/types.ts
```

## Imagenes

`supabase-image-loader.ts` es el loader de `next/image` para servir imagenes
de Supabase Storage. Se activa en `next.config.ts`:

```ts
images: {
  loader: "custom",
  loaderFile: "./src/services/assets/supabase-image-loader.ts",
},
```

En modo estatico, las imagenes van en `public/images/` y se referencian
como `/images/<archivo>`.
