// Pantalla de confirmación: resumen editable, validación del formulario, pago (redirección) y WhatsApp.
import { changeQty, clear, getItems, remove, subscribe } from '../lib/cart-store';
import { cartCount, cartTotal } from '../lib/cart';
import { EMPTY_CUSTOMER, validateCustomer } from '../lib/checkout-form';
import { formatPrice } from '../lib/format';
import { orderMessage, whatsappHref } from '../lib/whatsapp';
import type { CartItem, CustomerData } from '../types';

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);

const form = $<HTMLFormElement>('#checkout-form')!;
const summaryList = $('[data-summary-list]')!;
const rowTpl = $<HTMLTemplateElement>('#summary-row-template')!;
const totalEl = $('[data-summary-total]')!;
const countEl = $('[data-summary-count]')!;
const withItems = $<HTMLElement>('[data-with-items]')!;
const noItems = $<HTMLElement>('[data-no-items]')!;
const payBtn = $<HTMLButtonElement>('[data-pay]')!;
const waBtn = $<HTMLAnchorElement>('[data-wa-order]')!;
const statusEl = $('[data-checkout-status]')!;
const mpUrl = form.dataset.mpUrl!;
const waNumber = form.dataset.waNumber!;

const readCustomer = (): CustomerData => {
  const data = new FormData(form);
  const out = { ...EMPTY_CUSTOMER };
  (Object.keys(out) as (keyof CustomerData)[]).forEach((k) => (out[k] = String(data.get(k) ?? '').trim()));
  return out;
};

const renderRow = (item: CartItem) => {
  const row = rowTpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
  row.dataset.key = item.key;
  $('.srow__name', row)!.textContent = item.name;
  $('.srow__variant', row)!.textContent = item.variant ? `Talle ${item.variant}` : '';
  $('.srow__n', row)!.textContent = String(item.qty);
  $('.srow__unit', row)!.textContent = `${formatPrice(item.price)} c/u`;
  $('.srow__price', row)!.textContent = formatPrice(item.price * item.qty);
  return row;
};

const refreshWhatsApp = () => {
  waBtn.href = whatsappHref(waNumber, orderMessage(getItems(), readCustomer()));
};

subscribe((items) => {
  const has = items.length > 0;
  withItems.hidden = !has;
  noItems.hidden = has;
  summaryList.replaceChildren(...items.map(renderRow));
  totalEl.textContent = formatPrice(cartTotal(items));
  const n = cartCount(items);
  countEl.textContent = `${n} ${n === 1 ? 'producto' : 'productos'}`;
  refreshWhatsApp();
});

summaryList.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const row = target.closest<HTMLElement>('.srow');
  if (!row?.dataset.key) return;
  const key = row.dataset.key;
  const current = Number($('.srow__n', row)?.textContent ?? 1);
  if (target.closest('[data-qty-inc]')) changeQty(key, current + 1);
  else if (target.closest('[data-qty-dec]')) changeQty(key, current - 1);
  else if (target.closest('[data-remove]')) remove(key);
});

form.addEventListener('input', (e) => {
  const field = (e.target as HTMLElement).closest<HTMLElement>('.field');
  if (field) setError(field.querySelector<HTMLInputElement>('[name]')!, '');
  refreshWhatsApp();
});

const setError = (input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, message: string) => {
  const err = $(`#err-${input.name}`);
  if (err) {
    err.textContent = message;
    (err as HTMLElement).hidden = !message;
  }
  input.toggleAttribute('aria-invalid', Boolean(message));
  if (!message) input.removeAttribute('aria-invalid');
};

const showErrors = (errors: ReturnType<typeof validateCustomer>) => {
  form.querySelectorAll<HTMLInputElement>('[name]').forEach((input) => setError(input, errors[input.name as keyof CustomerData] ?? ''));
  const first = form.querySelector<HTMLInputElement>('[aria-invalid]');
  first?.focus();
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (getItems().length === 0) return;

  const errors = validateCustomer(readCustomer());
  showErrors(errors);
  if (Object.keys(errors).length > 0) {
    statusEl.textContent = 'Revisá los campos marcados para poder seguir.';
    return;
  }

  payBtn.disabled = true;
  statusEl.textContent = 'Te llevamos a Mercado Pago…';
  // Hoy es un link placeholder (config/checkout.ts). En producción acá se pide la preferencia a la función
  // serverless y se redirige a su `init_point` (docs/mercadopago-checkout.md).
  window.location.assign(mpUrl);
});

$('[data-clear]')?.addEventListener('click', () => clear());
