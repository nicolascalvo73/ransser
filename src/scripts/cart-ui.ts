// Conecta el DOM (header, drawer, botones "Sumar al pedido") con el store del carrito. Sin lógica de negocio.
import { add, changeQty, clear, getItems, remove, subscribe } from '../lib/cart-store';
import { MAX_QTY, cartCount, cartTotal } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { closeDialog, openDialog, pulse, wireDialog } from './dialog-motion';
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

let lastCount = cartCount(getItems());
const render = (items: CartItem[]) => {
  const count = cartCount(items);
  if (count > lastCount) pulse(badge);
  lastCount = count;
  if (badge) badge.textContent = String(count);
  $('[data-cart-open]')?.setAttribute('aria-label', `Abrir tu pedido, ${count} ${count === 1 ? 'producto' : 'productos'}`);
  if (!list || !rowTpl) return;
  list.replaceChildren(...items.map(renderRow));
  if (empty) (empty as HTMLElement).hidden = items.length > 0;
  if (foot) foot.hidden = items.length === 0;
  if (totalEl) totalEl.textContent = formatPrice(cartTotal(items));
};

subscribe(render);

const closeDrawer = () => drawer && closeDialog(drawer, 'drawer');
wireDialog(drawer, 'drawer');

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  if (target.closest('[data-cart-open]')) return void (drawer && openDialog(drawer, 'drawer'));
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

/* ---------- Modal "Elegir talle" ---------- */
const modal = $<HTMLDialogElement>('#size-modal');
const sizesBox = $('[data-modal-sizes]');
const confirmBtn = $<HTMLButtonElement>('[data-modal-confirm]');
const modalError = $<HTMLElement>('[data-modal-error]');
let picking: { id: string; name: string; price: number } | null = null;
let chosen: string | null = null;

const setChosen = (size: string | null) => {
  chosen = size;
  sizesBox?.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === size)));
  if (confirmBtn) confirmBtn.disabled = size === null;
  if (modalError && size) modalError.hidden = true;
};

const openSizeModal = (btn: HTMLElement) => {
  const { id, name, price, priceText, sizes, href } = btn.dataset;
  if (!modal || !sizesBox || !id || !name || !sizes) return;
  picking = { id, name, price: Number(price) };
  $('[data-modal-name]')!.textContent = name;
  $('[data-modal-price]')!.textContent = priceText ?? '';
  $('[data-modal-link]')!.setAttribute('href', href ?? '#');
  $('[data-modal-note]')!.textContent =
    btn.hasAttribute('data-sizes-placeholder')
      ? 'Talles de ejemplo: los reales se confirman antes del pago, junto con stock y costo de envío.'
      : 'Confirmamos stock, talle y costo de envío antes del pago.';
  sizesBox.replaceChildren(
    ...sizes.split(',').map((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.size = s;
      b.textContent = s;
      b.setAttribute('aria-pressed', 'false');
      return b;
    }),
  );
  setChosen(null);
  openDialog(modal, 'modal');
};

const closeSizeModal = () => modal && closeDialog(modal, 'modal');
wireDialog(modal, 'modal');

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const pick = target.closest<HTMLElement>('[data-pick-size]');
  if (pick) return openSizeModal(pick);
  if (target === modal || target.closest('[data-modal-close]')) return closeSizeModal();
  const sizeBtn = target.closest<HTMLElement>('[data-modal] [data-size]');
  if (sizeBtn) return setChosen(sizeBtn.dataset.size ?? null);
  if (target.closest('[data-modal-confirm]')) {
    if (!picking || !chosen) {
      if (modalError) modalError.hidden = false;
      return;
    }
    add({ id: picking.id, name: picking.name, price: picking.price, variant: chosen });
    announce(`${picking.name}, talle ${chosen} sumado al pedido.`);
    closeSizeModal();
  }
});
