import data from '../data/products.json';
import { CATEGORIES } from '../data/categories';
import type { Category, CategoryId, Product } from '../types';

export const PRODUCTS = data as Product[];

export const productsByCategory = (id: CategoryId) => PRODUCTS.filter((p) => p.category === id);

export const getCategory = (id: CategoryId): Category => {
  const c = CATEGORIES.find((cat) => cat.id === id);
  if (!c) throw new Error(`Categoría desconocida: ${id}`);
  return c;
};

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const productHref = (p: Pick<Product, 'slug'>) => `/producto/${p.slug}`;

/** Un producto se puede sumar al carrito sólo si tiene precio. */
export const isPurchasable = (p: Product): p is Product & { price: number } => p.price !== null;

export const related = (p: Product, max = 3) => PRODUCTS.filter((o) => o.category === p.category && o.id !== p.id).slice(0, max);
