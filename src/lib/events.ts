import raw from '../data/events.json';
import { EventosSchema, type Evento, type EventType } from '../data/events.schema';

const TZ = 'America/Argentina/Buenos_Aires';

export const TYPE_LABEL: Record<EventType, string> = { rodada: 'Rodada', motoencuentro: 'Motoencuentro', ride: 'Ride' };
export const TYPE_LABEL_PLURAL: Record<EventType, string> = { rodada: 'Rodadas', motoencuentro: 'Motoencuentros', ride: 'Rides' };

const imageNames = new Set(
  Object.keys(import.meta.glob('/src/assets/images/*.webp')).map((p) => p.split('/').pop()!.replace(/\.webp$/, '')),
);

/** Valida el JSON; si algo está mal formado lanza un error legible y el build falla. */
export const parseEvents = (data: unknown): Evento[] => {
  const result = EventosSchema.safeParse(data);
  if (!result.success) {
    const lines = result.error.issues.map((i) => {
      const [idx, ...rest] = i.path;
      const who = typeof idx === 'number' ? `evento #${idx + 1}${(data as { id?: string }[])[idx]?.id ? ` ("${(data as { id: string }[])[idx].id}")` : ''}` : 'lista de eventos';
      return `  - ${who}${rest.length ? `, campo "${rest.join('.')}"` : ''}: ${i.message}`;
    });
    throw new Error(`src/data/events.json tiene errores:\n${lines.join('\n')}`);
  }
  const missing = result.data.filter((e) => e.imagen && !imageNames.has(e.imagen));
  if (missing.length) {
    throw new Error(`src/data/events.json: imagen inexistente en src/assets/images/: ${missing.map((e) => `"${e.imagen}.webp" (evento "${e.id}")`).join(', ')}`);
  }
  return result.data;
};

/** Un evento está vencido cuando su fin (o su inicio, si no tiene fin) ya pasó. */
export const isPast = (e: Evento, now: Date) => Date.parse(e.fechaFin ?? e.fecha) < now.getTime();

/** Próximos eventos: sin vencidos, por fecha ascendente; el primer destacado pasa adelante. */
export const upcomingEvents = (events: Evento[], now: Date): Evento[] => {
  const list = events.filter((e) => !isPast(e, now)).sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
  const feat = list.findIndex((e) => e.destacado);
  return feat > 0 ? [list[feat], ...list.slice(0, feat), ...list.slice(feat + 1)] : list;
};

export const getUpcomingEvents = (now = new Date()) => upcomingEvents(parseEvents(raw), now);

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-AR', { timeZone: TZ, ...opts }).format(new Date(d));

export interface EventDateParts {
  day: string;
  month: string;
  weekday: string;
  time: string;
  /** Texto largo para lectores de pantalla y mensajes: "sábado 24 de octubre, 09:00 hs". */
  long: string;
}

export const eventDateParts = (e: Pick<Evento, 'fecha' | 'fechaFin'>): EventDateParts => {
  const day = fmt(e.fecha, { day: 'numeric' });
  const time = fmt(e.fecha, { hour: '2-digit', minute: '2-digit', hour12: false });
  const endDay = e.fechaFin && fmt(e.fechaFin, { day: 'numeric', month: 'numeric' }) !== fmt(e.fecha, { day: 'numeric', month: 'numeric' }) ? fmt(e.fechaFin, { day: 'numeric' }) : null;
  const month = fmt(e.fecha, { month: 'short' }).replace('.', '');
  const longDate = fmt(e.fecha, { weekday: 'long', day: 'numeric', month: 'long' });
  return {
    day: endDay ? `${day}–${endDay}` : day,
    month,
    weekday: fmt(e.fecha, { weekday: 'short' }).replace('.', ''),
    time,
    long: `${longDate}${endDay ? ` al ${endDay}` : ''}, ${time} hs`,
  };
};

export const mapsHref = (e: Pick<Evento, 'lugar' | 'ciudad' | 'provincia'>) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.lugar}, ${e.ciudad}, ${e.provincia}`)}`;

/** JSON-LD schema.org/Event. Sin organizador ni datos que el evento no tenga. */
export const eventStructuredData = (e: Evento, imageUrl?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: e.titulo,
  startDate: e.fecha,
  ...(e.fechaFin && { endDate: e.fechaFin }),
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: e.lugar,
    address: { '@type': 'PostalAddress', addressLocality: e.ciudad, addressRegion: e.provincia, addressCountry: 'AR' },
  },
  description: e.descripcion,
  ...(e.linkInfo && { url: e.linkInfo }),
  ...(imageUrl && { image: imageUrl }),
});

