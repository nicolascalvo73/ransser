// Conecta el DOM (header, drawer, botones "Sumar al pedido") con el store del carrito. Sin lógica de negocio.
import { add, changeQty, clear, remove, subscribe } from '../lib/cart-store';
import { MAX_QTY, cartCount, cartTotal } from '../lib/cart';
import { formatPrice } from '../lib/format';
import type { CartItem } from '../types';

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);

const drawer = $<HTMLDialogElement>('#cart-drawer');
const live = $('[data-cart-live]');
const badge = $('[data-cart-count]');
const list = $('[data-cart-list]');
const empty = $('[data-cart-empty]');
const foot = $<HTMLElement>('[data-cart-foot]');
const totalEl = $('[data-cart-total]');
const rowTpl = $<HTMLTemplateElement>('#cart-row-template');

const announce = (msg: string) => {
  if (!live) return;
  live.textContent = '';
  // Un tick vacío antes de escribir fuerza a los lectores de pantalla a re-anunciar.
  setTimeout(() => (live.textContent = msg), 30);
};

const renderRow = (item: CartItem) => {
  const row = rowTpl!.content.firstElementChild!.cloneNode(true) as HTMLElement;
  row.dataset.key = item.key;
  $('.row__name', row)!.textContent = item.name;
  $('.row__variant', row)!.textContent = item.variant ? `Talle ${item.variant}` : '';
  $('.row__n', row)!.textContent = String(item.qty);
  $('.row__price', row)!.textContent = formatPrice(item.price * item.qty);
  return row;
};

const render = (items: CartItem[]) => {
  const count = cartCount(items);
  if (badge) {
    badge.textContent = String(count);
    (badge as HTMLElement).hidden = count === 0;
  }
  if (!list || !rowTpl) return;
  list.replaceChildren(...items.map(renderRow));
  if (empty) (empty as HTMLElement).hidden = items.length > 0;
  if (foot) foot.hidden = items.length === 0;
  if (totalEl) totalEl.textContent = formatPrice(cartTotal(items));
};

subscribe(render);

const closeDrawer = () => drawer?.close();

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  if (target.closest('[data-cart-open]')) return void drawer?.showModal();
  if (target.closest('[data-cart-close]')) return closeDrawer();
  if (target === drawer) return closeDrawer(); // click en el backdrop
  if (target.closest('[data-cart-clear]')) {
    clear();
    return announce('Vaciaste el pedido.');
  }

  const rowEl = target.closest<HTMLElement>('.row');
  if (rowEl?.dataset.key) {
    const key = rowEl.dataset.key;
    const current = Number($('.row__n', rowEl)?.textContent ?? 1);
    if (target.closest('[data-qty-inc]')) return changeQty(key, current + 1);
    if (target.closest('[data-qty-dec]')) return changeQty(key, current - 1);
    if (target.closest('[data-remove]')) return remove(key);
  }

  const step = target.closest<HTMLElement>('[data-step]');
  if (step) {
    const input = $<HTMLInputElement>(step.dataset.stepTarget ?? '');
    if (input) input.value = String(Math.max(1, Math.min(MAX_QTY, Number(input.value || 1) + Number(step.dataset.step))));
    return;
  }

  const addBtn = target.closest<HTMLButtonElement>('[data-add-to-cart]');
  if (addBtn) handleAdd(addBtn);
});

const handleAdd = (btn: HTMLButtonElement) => {
  const { id, name, price, variantFrom, qtyFrom } = btn.dataset;
  if (!id || !name || !Number.isFinite(Number(price))) return;

  let variant: string | undefined;
  if (variantFrom) {
    const picked = $<HTMLInputElement>(`${variantFrom} input:checked`);
    const errorEl = $<HTMLElement>('[data-size-error]');
    if (!picked) {
      if (errorEl) errorEl.hidden = false;
      return $<HTMLInputElement>(`${variantFrom} input`)?.focus();
    }
    if (errorEl) errorEl.hidden = true;
    variant = picked.value;
  }

  const qty = qtyFrom ? Math.max(1, Number($<HTMLInputElement>(qtyFrom)?.value || 1)) : 1;
  add({ id, name, price: Number(price), variant }, qty);
  announce(`${qty} x ${name}${variant ? `, talle ${variant}` : ''} sumado al pedido.`);

  btn.classList.add('is-added');
  setTimeout(() => btn.classList.remove('is-added'), 1200);
};
