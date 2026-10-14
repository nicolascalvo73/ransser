import { parseCart } from './cart';
import type { CartItem } from '../types';

export const CART_STORAGE_KEY = 'ransser-cart-v1';

// localStorage puede no existir o lanzar (modo privado, datos bloqueados): el carrito sigue andando en memoria.
export const loadCart = (): CartItem[] => {
  try {
    return parseCart(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]'));
  } catch {
    return [];
  }
};

export const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* sin persistencia: el carrito vive sólo en memoria */
  }
};
