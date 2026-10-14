export const SITE = {
  name: 'Ransser',
  fullName: 'Ransser Indumentaria',
  title: 'Ransser | Indumentaria y accesorios para moteros',
  description:
    'Camperas, pantalones y camping para moteros y motoviajeros. Pedí por la web o por WhatsApp. Envíos a todo el país.',
  tagline: 'Indumentaria y accesorios para moteros',
  instagram: 'https://www.instagram.com/ransser.indumentaria',
  instagramHandle: '@ransser.indumentaria',
  instagramFollowers: 8180,
  whatsapp: '5493462543591',
  whatsappLabel: '+54 9 3462 54-3591',
  whatsappCatalog: 'https://wa.me/c/5493462543591',
  mondi: 'https://mondistudio.com.ar',
  /** Fecha en que se relevaron los precios del catálogo. */
  pricesSurveyedAt: '2026-10-01',
} as const;

/** Productos vistos en Instagram sin precio relevado: sólo consulta por WhatsApp, sin precio inventado. */
export const ASK_ABOUT = [
  { id: 'traje-lluvia', name: 'Traje de lluvia compacto' },
  { id: 'mochilas', name: 'Mochilas y alforjas oliva' },
  { id: 'musleras', name: 'Musleras' },
  { id: 'camisaco', name: 'Camisaco' },
  { id: 'hamaca-mosquitero', name: 'Hamaca con mosquitero' },
  { id: 'tarp-3x3', name: 'Tarp 3x3' },
] as const;
