export type CategoryId = 'indumentaria' | 'camping' | 'outlet';

export type IconName =
  | 'whatsapp' | 'instagram' | 'cart' | 'plus' | 'minus' | 'trash' | 'close' | 'menu' | 'arrow'
  | 'check' | 'truck' | 'shield' | 'tent' | 'jacket' | 'tag' | 'chat' | 'camera';

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  icon: IconName;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  /** Una línea para la card. */
  summary: string;
  /** Descripción completa tomada del catálogo (con erratas evidentes corregidas). */
  description: string;
  description_is_placeholder?: boolean;
  /** ARS. `null` = no figura en el catálogo: se consulta por WhatsApp. */
  price: number | null;
  price_before?: number;
  /** Los precios se muestran como de ejemplo (ver footer). */
  price_is_placeholder: true;
  price_surveyed_at: string;
  badge?: string;
  /** Nombre de archivo en src/assets/images (sin extensión). `null` = placeholder "Foto real a cargar". */
  image: string | null;
  imageAlt: string;
  features: string[];
  specs: ProductSpec[];
  sizes: string[] | null;
  sizes_is_placeholder?: boolean;
  featured?: boolean;
}

export interface CartItem {
  /** `id` + talle: dos talles del mismo producto son renglones distintos. */
  key: string;
  id: string;
  name: string;
  price: number;
  variant?: string;
  qty: number;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  notes: string;
}

export type CustomerErrors = Partial<Record<keyof CustomerData, string>>;
