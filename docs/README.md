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
  estructuras/       <- las estructuras de datos (PILA y COLA) y su modelo
  services/          <- capa de datos del sitio (payload i18n)
  decisions/         <- decisiones tecnicas y por que se tomaron
  i18n/              <- idioma: como se elige y como se traduce
```

## Los modulos

| Modulo        | Que documenta                                                              |
| ------------- | -------------------------------------------------------------------------- |
| `estructuras` | La PILA y la COLA: modelo en memoria, algoritmos, errores y flujo de la UI |
| `theming`     | Las 4 paletas, los tokens y **como agregar una paleta nueva**              |
| `motion`      | Las primitivas de animacion y las reglas de `LazyMotion`                   |
| `data`        | El contrato `content`/`metadata` y el origen estatico                      |
| `components`  | Atomic design: los tres niveles y como agregar un componente               |
| `services`    | La capa de datos del sitio: payload estatico por idioma                    |
| `decisions`   | Las decisiones tecnicas con contexto y alternativas descartadas            |
| `i18n`        | El idioma por query param, los datos por idioma y el tipo `Language`       |

## Donde empezar

| Si queres...                    | Lee                                 |
| ------------------------------- | ----------------------------------- |
| Levantar el proyecto            | `README.md` de la raiz del proyecto |
| Entender la PILA o la COLA      | `estructuras/README.md`             |
| Agregar una paleta              | `theming/paleta-nueva.md`           |
| Entender por que Bun y no pnpm  | `decisions/package-manager-bun.md`  |
| Agregar un idioma               | `i18n/README.md`                    |
| Agregar una estructura de datos | `estructuras/README.md` (receta)    |
| Agregar un componente           | `components/README.md`              |

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

## Otros proyectos

Este proyecto forma parte de un conjunto de estructuras de datos que se
van a ir implementando: Pila y Cola son las primeras, y la idea es ir agregando
Cola, Lista, Arbol y demas para poder visualizarlas y probarlas en el
navegador.

Si te interesa ver mas trabajo mio, aca esta mi
[portafolio](https://emmanueltech.vercel.app/).
