import type { CartItem } from '../types';

export const MAX_QTY = 99;

const clamp = (qty: number) => Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));

export const cartKey = (id: string, variant?: string) => (variant ? `${id}::${variant}` : id);

/** Suma `qty` unidades; si el renglón (producto + talle) ya existe, incrementa su cantidad. */
export const addItem = (items: CartItem[], item: Omit<CartItem, 'qty' | 'key'>, qty = 1): CartItem[] => {
  const key = cartKey(item.id, item.variant);
  const existing = items.find((i) => i.key === key);
  if (!existing) return [...items, { ...item, key, qty: clamp(qty) }];
  return items.map((i) => (i.key === key ? { ...i, qty: clamp(i.qty + qty) } : i));
};

export const removeItem = (items: CartItem[], key: string): CartItem[] => items.filter((i) => i.key !== key);

/** Fija la cantidad; con 0 o menos quita el renglón. */
export const setQty = (items: CartItem[], key: string, qty: number): CartItem[] =>
  clamp(qty) === 0 ? removeItem(items, key) : items.map((i) => (i.key === key ? { ...i, qty: clamp(qty) } : i));

export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.qty, 0);

export const cartTotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.qty, 0);

/** Valida lo leído de localStorage: descarta cualquier entrada con forma inesperada. */
export const parseCart = (raw: unknown): CartItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((r): CartItem[] => {
    const ok =
      r &&
      typeof r.id === 'string' &&
      typeof r.name === 'string' &&
      (r.variant === undefined || typeof r.variant === 'string') &&
      Number.isFinite(r.price) &&
      r.price >= 0 &&
      Number.isInteger(r.qty) &&
      r.qty > 0;
    if (!ok) return [];
    return [{ key: cartKey(r.id, r.variant), id: r.id, name: r.name, price: r.price, variant: r.variant, qty: clamp(r.qty) }];
  });
};
