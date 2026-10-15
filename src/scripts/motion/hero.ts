import { gsap } from 'gsap';

/** Intro del hero: líneas del h1 que suben, fade del resto, foto con clip-path, subrayado y contador. */
export const heroIntro = () => {
  if (!document.querySelector('[data-g="hero"]')) return;

  gsap
    .timeline({ defaults: { ease: 'power4.out' } })
    .from('[data-hero-line] > span', { yPercent: 115, duration: 1.2, stagger: 0.12 })
    .from('[data-hero-fade]', { y: 28, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=0.7')
    .from('[data-hero-photo]', { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power3.inOut' }, 0.2)
    .from('[data-underline]', { scaleX: 0, transformOrigin: '0 50%', duration: 1, ease: 'power3.inOut' }, '-=0.9');

  // Contador de seguidores: el HTML ya trae el valor final; acá sólo se anima desde 0.
  const el = document.querySelector<HTMLElement>('[data-count]');
  const target = Number(el?.dataset.count);
  if (el && Number.isFinite(target)) {
    const fmt = new Intl.NumberFormat('es-AR');
    const o = { v: 0 };
    el.textContent = fmt.format(0);
    gsap.to(o, { v: target, duration: 2.2, delay: 0.6, ease: 'power2.out', onUpdate: () => (el.textContent = fmt.format(Math.round(o.v))) });
  }
};
