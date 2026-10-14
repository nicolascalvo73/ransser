import { addItem, removeItem, setQty } from './cart';
import { CART_STORAGE_KEY, loadCart, saveCart } from './cart-storage';
import type { CartItem } from '../types';

type Listener = (items: CartItem[]) => void;

/** Estado del carrito en el cliente: memoria como fuente de verdad, localStorage como respaldo. */
let items: CartItem[] = loadCart();
const listeners = new Set<Listener>();

const commit = (next: CartItem[]) => {
  items = next;
  saveCart(items);
  listeners.forEach((fn) => fn(items));
};

export const getItems = () => items;

export const subscribe = (fn: Listener) => {
  listeners.add(fn);
  fn(items);
  return () => listeners.delete(fn);
};

export const add = (item: Omit<CartItem, 'qty' | 'key'>, qty = 1) => commit(addItem(items, item, qty));
export const changeQty = (key: string, qty: number) => commit(setQty(items, key, qty));
export const remove = (key: string) => commit(removeItem(items, key));
export const clear = () => commit([]);

// Sincroniza entre pestañas (y con la otra página del sitio abierta en paralelo).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== CART_STORAGE_KEY) return;
    items = loadCart();
    listeners.forEach((fn) => fn(items));
  });
}
