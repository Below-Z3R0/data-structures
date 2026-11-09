# Graphify

Esta carpeta aloja el output de Graphify, el grafo de dependencias del codigo.

## Estado

Vacia a proposito. El output es generado localmente y no se trackea en git.

## Como se genera

```bash
# 1. Instalar graphify en el venv del proyecto
python3 -m venv .venv
source .venv/bin/activate
pip install "graphifyy[openai]"

# 2. Extraer el grafo
graphify extract src/ --out docs/graphify/
```

Eso genera `docs/graphify/graphify-out/` con:

| Archivo | Para que sirve |
|---|---|
| `graph.json` | Grafo de imports y dependencias, consultable con `jq` |
| `GRAPH_REPORT.md` | Overview legible del proyecto (1 lectura, ~2k tokens) |
| `graph.html` | Visualizacion interactiva del grafo |

## Consultas utiles

```bash
# Overview rápido
cat docs/graphify/graphify-out/GRAPH_REPORT.md

# Que importa un archivo
jq '.edges[] | select(.target | contains("site.ts")) | .source' \
  docs/graphify/graphify-out/graph.json

# Verificacion interactiva
xdg-open docs/graphify/graphify-out/graph.html
```

## Reglas

- El output **no** se commitea: ya esta en `.gitignore`.
- Regenerar solo cuando hay cambios estructurales grandes (5+ archivos
  modificados, schema nuevo, API nueva).
- Para busquedas puntuales en el codigo usar `search_files`, no Graphify.
