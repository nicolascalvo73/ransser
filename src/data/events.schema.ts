import { z } from 'astro/zod';

export const EVENT_TYPES = ['rodada', 'motoencuentro', 'ride'] as const;

// Fecha ISO 8601 con hora y huso (ej. 2026-10-24T09:00:00-03:00).
const isoDateTime = z.iso.datetime({ offset: true, message: 'debe ser ISO 8601 con hora y huso, ej. 2026-10-24T09:00:00-03:00' });

export const EventoSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'sólo minúsculas, números y guiones'),
    tipo: z.enum(EVENT_TYPES, { message: `debe ser uno de: ${EVENT_TYPES.join(', ')}` }),
    titulo: z.string().min(3),
    fecha: isoDateTime,
    fechaFin: isoDateTime.optional(),
    lugar: z.string().min(2),
    ciudad: z.string().min(2),
    provincia: z.string().min(2),
    descripcion: z.string().min(1).max(140, 'máximo 140 caracteres'),
    tieneStand: z.boolean(),
    linkInfo: z.url({ protocol: /^https?$/, message: 'debe ser una URL http(s) completa' }).optional(),
    /** Nombre de archivo en src/assets/images (sin extensión), WebP optimizada. */
    imagen: z.string().optional(),
    destacado: z.boolean(),
    /** Evento ficticio de la propuesta: se rotula en la UI y no emite JSON-LD. */
    ejemplo: z.boolean().default(false),
  })
  .strict()
  .refine((e) => !e.fechaFin || Date.parse(e.fechaFin) >= Date.parse(e.fecha), {
    message: 'fechaFin no puede ser anterior a fecha',
    path: ['fechaFin'],
  });

export const EventosSchema = z.array(EventoSchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  list.forEach((e, i) => {
    if (seen.has(e.id)) ctx.addIssue({ code: 'custom', message: `id repetido: "${e.id}"`, path: [i, 'id'] });
    seen.add(e.id);
  });
  if (list.filter((e) => e.destacado).length > 1) {
    ctx.addIssue({ code: 'custom', message: 'sólo puede haber un evento destacado', path: [] });
  }
});

export type Evento = z.infer<typeof EventoSchema>;
export type EventType = (typeof EVENT_TYPES)[number];
