import { gsap } from 'gsap';
import { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel);
const has = (sel: string) => document.querySelector(sel) !== null;

/** Todo lo atado al scroll: progreso, nav, parallax, títulos, reveals, zoom de fotos, ruta de Envíos y footer. */
export const scrollEffects = () => {
  // Sin recorrido de scroll no hay nada que animar (y los reveals no se ocultan).
  if (document.documentElement.scrollHeight <= window.innerHeight + 120) return;

  gsap.to('[data-progress]', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

  // Nav: se esconde al bajar y vuelve al subir o cuando el teclado entra en él.
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (nav) {
    let hidden = false;
    const set = (hide: boolean) => {
      if (hide === hidden) return;
      hidden = hide;
      gsap.to(nav, { yPercent: hide ? -100 : 0, duration: 0.45, ease: 'power3.out' });
    };
    ST.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => set(self.direction === 1 && self.scroll() > 240 && !document.querySelector('dialog[open]')),
    });
    nav.addEventListener('focusin', () => set(false));
  }

  // Hero: parallax. La foto es 28 % más alta que su marco; 9 % de desplazamiento propio nunca deja huecos.
  const hero = { trigger: '[data-g="hero"]', start: 'top top', end: 'bottom top', scrub: true };
  if (has('[data-g="hero"]')) {
    gsap.to('[data-hero-photo-inner]', { yPercent: 9, ease: 'none', scrollTrigger: hero });
    gsap.to('[data-hero-title]', { xPercent: -4, ease: 'none', scrollTrigger: hero });
  }

  // Títulos: palabra por palabra.
  q('[data-title]').forEach((t) => {
    const words = t.querySelectorAll('.wi');
    if (words.length) gsap.from(words, { yPercent: 115, duration: 1.1, stagger: 0.08, ease: 'power4.out', scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
  });

  // Reveals en lote.
  if (has('[data-rv]')) gsap.set('[data-rv]', { y: 64, opacity: 0 });
  ST.batch('[data-rv]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.95, stagger: 0.1, ease: 'power3.out', overwrite: true }),
  });

  // Fotos de producto: zoom con scroll.
  q('[data-ph-inner]').forEach((el) =>
    gsap.fromTo(el, { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 45%', scrub: true } }),
  );

  if (has('#promo')) gsap.to('[data-stripes]', { xPercent: -25, ease: 'none', scrollTrigger: { trigger: '#promo', start: 'top bottom', end: 'bottom top', scrub: true } });
  if (has('[data-steps]')) gsap.fromTo('[data-line]', { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 78%', end: 'bottom 55%', scrub: true } });
  if (has('[data-bigword]')) gsap.from('[data-bigword]', { yPercent: 45, ease: 'none', scrollTrigger: { trigger: '[data-g="footer"]', start: 'top bottom', end: 'bottom bottom', scrub: true } });
};
