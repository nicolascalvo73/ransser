import { gsap } from 'gsap';

/** Efectos que sólo tienen sentido con mouse: botones magnéticos, filas de categorías y zoom de tarjetas. */
export const pointerEffects = () => {
  document.querySelectorAll<HTMLElement>('[data-mag]').forEach((el) => {
    const xt = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yt = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xt((e.clientX - r.left - r.width / 2) * 0.25);
      yt((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('mouseleave', () => {
      xt(0);
      yt(0);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
    const fill = row.querySelector('[data-fill]');
    const arrow = row.querySelector('[data-arrow]');
    const on = () => {
      gsap.to(fill, { scaleY: 1, duration: 0.55, ease: 'power3.out', overwrite: true });
      gsap.to(row, { color: '#0e0f10', duration: 0.3 });
      gsap.to(arrow, { rotate: 45, duration: 0.4, ease: 'back.out(2)' });
    };
    const off = () => {
      gsap.to(fill, { scaleY: 0, duration: 0.45, ease: 'power3.in', overwrite: true });
      gsap.to(row, { color: '#f1f0ea', duration: 0.3 });
      gsap.to(arrow, { rotate: 0, duration: 0.3 });
    };
    row.addEventListener('mouseenter', on);
    row.addEventListener('mouseleave', off);
    row.addEventListener('focus', on); // el teclado recibe el mismo relleno
    row.addEventListener('blur', off);
  });

  document.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    const ph = card.querySelector('[data-ph-hover]');
    if (!ph) return;
    card.addEventListener('mouseenter', () => gsap.to(ph, { scale: 1.07, duration: 0.7, ease: 'power3.out' }));
    card.addEventListener('mouseleave', () => gsap.to(ph, { scale: 1, duration: 0.7, ease: 'power3.out' }));
  });
};
