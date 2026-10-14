import { SITE } from '../data/site';
import type { Product } from '../types';

/** JSON-LD de la tienda. Sin dirección: la ciudad todavía no está confirmada. */
export const storeStructuredData = (siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  '@id': `${siteUrl}#store`,
  name: SITE.fullName,
  description: SITE.description,
  url: siteUrl,
  telephone: `+${SITE.whatsapp}`,
  areaServed: { '@type': 'Country', name: 'Argentina' },
  sameAs: [SITE.instagram],
});

export const productStructuredData = (p: Product, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  description: p.description,
  brand: { '@type': 'Brand', name: SITE.name },
  url,
  // Sin `offers`: los precios de la propuesta son de ejemplo y no deben publicarse como oferta real.
});
