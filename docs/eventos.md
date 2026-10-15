# Eventos (rodadas, motoencuentros y rides)

La sección `#eventos` de la home sale de `src/data/events.json`. El sitio es estático: lo que se ve es lo que había en ese archivo **al momento del build**.

## Agregar un evento
1. Editá `src/data/events.json` y sumá un objeto a la lista:

```json
{
  "id": "rodada-de-otonio",
  "tipo": "rodada",
  "titulo": "Rodada de otoño",
  "fecha": "2027-04-10T09:00:00-03:00",
  "fechaFin": "2027-04-11T18:00:00-03:00",
  "lugar": "Plaza principal",
  "ciudad": "Nombre de la ciudad",
  "provincia": "Santa Fe",
  "descripcion": "Hasta 140 caracteres, en voseo y sin promesas que no podamos cumplir.",
  "tieneStand": true,
  "linkInfo": "https://…",
  "imagen": "evento-rodada-de-otonio",
  "destacado": false,
  "ejemplo": false
}
```

| Campo | Regla |
|---|---|
| `id` | único; minúsculas, números y guiones |
| `tipo` | `rodada`, `motoencuentro` o `ride` |
| `fecha`, `fechaFin` | ISO 8601 **con hora y huso** (Argentina: `-03:00`). `fechaFin` es opcional y no puede ser anterior a `fecha` |
| `descripcion` | máximo 140 caracteres |
| `linkInfo` | opcional, URL `http(s)` completa (publicación u organizador) |
| `imagen` | opcional: nombre (sin `.webp`) de un archivo WebP en `src/assets/images/`, idealmente 800×500 (16:10) |
| `destacado` | sólo uno a la vez: va primero y con la card grande en desktop |
| `ejemplo` | `true` rotula la card como "Ejemplo" y **no** emite JSON-LD; en eventos reales va `false` |

2. Probá en local: `npm run build` (ya valida el JSON) y `npm run preview`.
3. Commit y push a `main`: el workflow despliega solo.

## Quitar un evento
Borrá su objeto del JSON, commit y push. No hace falta borrar los vencidos a mano.

## Qué pasa con los vencidos
En cada build se descartan los eventos cuyo fin (`fechaFin`, o `fecha` si no tiene) ya pasó. **Un evento vencido desaparece en el próximo build**, no en el momento exacto en que termina: hasta que se vuelva a desplegar, el HTML publicado lo sigue mostrando. Si no queda ningún evento próximo, la sección muestra "Pronto vamos a anunciar las próximas salidas", con links a Instagram y WhatsApp.

## Validación
El JSON se valida con zod (`src/data/events.schema.ts`, vía `astro/zod`, sin dependencias nuevas). Si un evento está mal formado, **el build falla** con un mensaje por campo, por ejemplo:

```
src/data/events.json tiene errores:
  - evento #2 ("ok"), campo "descripcion": máximo 140 caracteres
  - evento #3 ("dup"), campo "fechaFin": fechaFin no puede ser anterior a fecha
```

También falla si hay ids repetidos, más de un destacado o una `imagen` que no existe.

## Datos de ejemplo
Los eventos actuales son **ficticios** (`"ejemplo": true`): fechas relativas al día en que se generaron, lugares genéricos ("Ciudad de ejemplo") y sin organizadores reales. Las imágenes `evento-ejemplo-*.webp` también son de mentira. Para regenerarlos con fechas nuevas: `npm run events:example` (sobrescribe `events.json`). Antes de publicar eventos reales, reemplazá todo el archivo y borrá esas imágenes.

## Paso posterior sugerido: rebuild diario
Para que los vencidos se oculten solos, agregá un cron al workflow `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * *' # 06:00 UTC = 03:00 en Argentina
```

Notas: los workflows programados corren sólo desde la rama por defecto, y GitHub los pausa en repos públicos tras 60 días sin actividad (se reactivan con cualquier commit o desde la pestaña Actions).
