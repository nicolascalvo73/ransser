import { cartTotal } from './cart';
import { formatPrice } from './format';
import type { Evento } from '../data/events.schema';
import type { CartItem, CustomerData, Product } from '../types';

export const whatsappHref = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const generalMessage = () => 'Hola Ransser! Quería consultarte por la indumentaria y el camping para moto.';

export const askAboutMessage = (name: string) => `Hola Ransser! Vi "${name}" en Instagram. Me pasás precio y talles?`;

export const productMessage = (product: Pick<Product, 'name'>, variant?: string) =>
  `Hola Ransser! Quería consultarte por: ${product.name}${variant ? ` (talle ${variant})` : ''}. Me pasás precio y disponibilidad?`;

/** Pedido armado en la web, listo para mandar por WhatsApp. Los datos del cliente son opcionales. */
export const orderMessage = (items: CartItem[], customer?: Partial<CustomerData>) => {
  const lines = items.map(
    (i) => `• ${i.qty} x ${i.name}${i.variant ? ` (talle ${i.variant})` : ''} — ${formatPrice(i.price * i.qty)}`,
  );
  const dest = [customer?.address, customer?.city, customer?.province, customer?.postalCode ? `CP ${customer.postalCode}` : '']
    .filter(Boolean)
    .join(', ');
  return [
    'Hola Ransser! Quiero hacer este pedido:',
    '',
    ...lines,
    '',
    `Total estimado: ${formatPrice(cartTotal(items))}`,
    ...(customer?.name ? [`Nombre: ${customer.name}`] : []),
    ...(dest ? [`Envío a: ${dest}`] : []),
    ...(customer?.notes ? [`Notas: ${customer.notes}`] : []),
    'Me confirmás stock, talles y costo de envío?',
  ].join('\n');
};

/** Consulta por un evento: nombra el evento y la fecha. */
export const eventMessage = (e: Pick<Evento, 'titulo' | 'lugar' | 'ciudad' | 'tieneStand'>, dateLong: string) =>
  `Hola Ransser! Vi el evento "${e.titulo}" (${dateLong}) en ${e.lugar}, ${e.ciudad}. ${e.tieneStand ? 'Me pasás info sobre el stand?' : 'Me pasás más info?'}`;
