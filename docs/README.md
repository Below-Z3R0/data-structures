# Documentacion del template

Esta carpeta es la documentacion tecnica del proyecto. Cada subcarpeta es un
modulo del sistema y tiene su propio `README.md` con el indice de lo que hay
adentro.

## Como esta organizada

```
docs/
  README.md          <- este archivo: indice general
  template-guide.md  <- auditoria de la documentacion: que hay y que falta
  setup-database.md  <- modo Supabase: que corre y como (setup-database.sql)
  graphify/          <- output del grafo de codigo (generado, no se trackea)
  theming/           <- sistema de theming v2 (paletas, tokens, anti-FOUC)
  motion/            <- animaciones con motion (LazyMotion, variantes)
  data/              <- contrato de datos, modo estatico vs Supabase
  components/        <- atomic design: atoms, molecules, organisms
  services/          <- capa de servicios (env, assets, supabase)
  decisions/         <- decisiones tecnicas y por que se tomaron
  i18n/              <- idioma: como se elige y como se traduce
  auth-and-routes/   <- login, OAuth, route group (admin), middleware
```

## Los modulos

| Modulo            | Que documenta                                                        |
| ----------------- | -------------------------------------------------------------------- |
| `template-guide`  | Auditoria de la doc: los 10 sistemas, 6 casos de uso y que falta     |
| `setup-database`  | El paso a paso del modo Supabase: tablas, RPC, policies, carga       |
| `theming`         | Las 4 paletas, los tokens y **como agregar una paleta nueva**        |
| `motion`          | Las primitivas de animacion y las reglas de `LazyMotion`             |
| `data`            | El contrato `content`/`metadata` y los dos modos de datos            |
| `components`      | Atomic design: los tres niveles y como agregar un componente         |
| `services`        | Acceso a env, assets, clientes de Supabase                           |
| `decisions`       | Las decisiones tecnicas con contexto y alternativas descartadas      |
| `i18n`            | El idioma por query param, los datos por idioma y el tipo `Language` |
| `auth-and-routes` | El flujo de login, el callback de OAuth y el guard de rol            |

## Donde empezar

| Si queres...                    | Lee                                          |
| ------------------------------- | -------------------------------------------- |
| Levantar el proyecto            | `README.md` de la raiz + `setup-database.md` |
| Agregar una paleta              | `theming/paleta-nueva.md`                    |
| Cambiar el modo de datos        | `decisions/data-source-switch.md`            |
| Entender por que Bun y no pnpm  | `decisions/package-manager-bun.md`           |
| Agregar un idioma               | `i18n/README.md`                             |
| Tocar el login o el panel admin | `auth-and-routes/README.md`                  |
| Saber que falta documentar      | `template-guide.md`                          |

## Convenciones

- Archivos en `kebab-case`, sin enumeraciones ni fechas en el nombre.
- Cada carpeta arranca con un `README.md` que indexa su contenido.
- La documentacion describe el estado actual del codigo, no la historia.
- Los documentos nuevos llevan frontmatter (`type`, `status`, `created`,
  `tags`).

## Agregar un modulo

1. Crear la carpeta: `docs/<modulo>/`
2. Crear `docs/<modulo>/README.md` con el indice y el contexto.
3. Sumarlo a la lista de este README.

## Donde NO va la documentacion

- El proposito del template y como se usa: `README.md` de la raiz.
- Las reglas para el agente que trabaja en el proyecto: `.hermes.md`.
- El punto de entrada para agentes: `AGENTS.md`.
