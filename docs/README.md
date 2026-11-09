# Documentacion del proyecto

Esta carpeta es la documentacion tecnica del proyecto. Cada subcarpeta es
un modulo del sistema y tiene su propio `README.md` con el indice de lo
que hay adentro.

## Como esta organizada

```
docs/
  README.md          <- este archivo: indice general
  graphify/          <- output del grafo de codigo (generado, no se trackea)
  theming/           <- sistema de theming v2 (paletas, tokens, anti-FOUC)
  motion/            <- animaciones con motion (LazyMotion, variantes)
  data/              <- contrato de datos y modo estatico
  components/        <- atomic design: atoms, molecules, organisms
  structures/        <- las estructuras de datos (PILA) y su modelo
  services/          <- capa de servicios (datos, logica de estructuras)
  decisions/         <- decisiones tecnicas y por que se tomaron
  i18n/              <- idioma: como se elige y como se traduce
```

## Los modulos

| Modulo        | Que documenta                                                        |
| ------------- | -------------------------------------------------------------------- |
| `structures`  | La PILA: modelo en memoria, algoritmos, errores y el flujo de la UI    |
| `theming`     | Las 4 paletas, los tokens y **como agregar una paleta nueva**        |
| `motion`      | Las primitivas de animacion y las reglas de `LazyMotion`             |
| `data`        | El contrato `content`/`metadata` y el origen estatico                 |
| `components`  | Atomic design: los tres niveles y como agregar un componente         |
| `services`    | La capa de servicios: datos estaticos y logica de estructuras        |
| `decisions`   | Las decisiones tecnicas con contexto y alternativas descartadas      |
| `i18n`        | El idioma por query param, los datos por idioma y el tipo `Language` |

## Donde empezar

| Si queres...                       | Lee                                |
| ---------------------------------- | ---------------------------------- |
| Levantar el proyecto               | `README.md` de la raiz del proyecto |
| Entender la PILA                  | `structures/README.md`             |
| Agregar una paleta                 | `theming/paleta-nueva.md`          |
| Entender por que Bun y no pnpm     | `decisions/package-manager-bun.md` |
| Agregar un idioma                  | `i18n/README.md`                   |
| Agregar una estructura de datos    | `structures/README.md`             |
| Agregar un componente              | `components/README.md`             |

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

- El proposito del proyecto y como se usa: `README.md` de la raiz.
- Las reglas para el agente que trabaja en el proyecto: `.hermes.md`.
- El punto de entrada para agentes: `AGENTS.md`.
