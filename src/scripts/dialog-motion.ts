// Entrada y salida animadas de <dialog> (drawer y modal de talle). Se sigue usando showModal()/close():
// el foco, Escape y el bloqueo del fondo son nativos. GSAP se trae bajo demanda para no pesar en /checkout.
type Kind = 'drawer' | 'modal';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loadGsap = () => import('gsap').then((m) => m.gsap).catch(() => null);
const panelOf = (d: HTMLDialogElement, kind: Kind) => d.querySelector<HTMLElement>(kind === 'drawer' ? '.drawer__panel' : '[data-modal]');
const closing = new WeakSet<HTMLDialogElement>();

const reset = (d: HTMLDialogElement, panel: HTMLElement | null) => {
  if (panel) {
    panel.style.removeProperty('transform');
    panel.style.removeProperty('opacity');
  }
  d.style.removeProperty('--bo');
};

export const openDialog = async (d: HTMLDialogElement, kind: Kind) => {
  if (d.open) return;
  const panel = panelOf(d, kind);
  if (reduced() || !panel) return d.showModal();

  // Se pre-oculta con un estilo en línea (no con CSS): si GSAP no carga, se limpia y el diálogo queda visible.
  if (kind === 'drawer') panel.style.transform = 'translateX(100%)';
  else panel.style.opacity = '0';
  d.style.setProperty('--bo', '0');
  d.showModal();

  const gsap = await loadGsap();
  if (!gsap) return reset(d, panel);
  reset(d, panel);
  gsap.fromTo(d, { '--bo': 0 }, { '--bo': 1, duration: 0.4 });
  if (kind === 'drawer') gsap.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'power4.out', clearProps: 'transform' });
  else gsap.fromTo(panel, { y: 48, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power4.out', clearProps: 'transform,opacity' });
};

/** Anima la salida y recién después llama a dialog.close(). */
export const closeDialog = async (d: HTMLDialogElement, kind: Kind) => {
  if (!d.open || closing.has(d)) return;
  const panel = panelOf(d, kind);
  if (reduced() || !panel) return d.close();
  const gsap = await loadGsap();
  if (!gsap) return d.close();

  closing.add(d);
  const done = () => {
    d.close();
    gsap.set(panel, { clearProps: 'all' });
    d.style.removeProperty('--bo');
    closing.delete(d);
  };
  gsap.to(d, { '--bo': 0, duration: 0.35 });
  if (kind === 'drawer') gsap.to(panel, { xPercent: 100, duration: 0.5, ease: 'power3.in', onComplete: done });
  else gsap.to(panel, { y: 40, opacity: 0, duration: 0.35, ease: 'power3.in', onComplete: done });
};

/** Escape cierra con animación. */
export const wireDialog = (d: HTMLDialogElement | null, kind: Kind) =>
  d?.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDialog(d, kind);
  });

/** Rebote del contador del carrito al sumar. */
export const pulse = async (el: Element | null) => {
  if (!el || reduced()) return;
  (await loadGsap())?.fromTo(el, { scale: 1.7 }, { scale: 1, duration: 0.55, ease: 'back.out(3)' });
};
