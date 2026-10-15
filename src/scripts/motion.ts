// Movimiento de la página (GSAP + ScrollTrigger). Se carga sólo en las páginas que lo piden (ver BaseLayout `motion`).
// Regla: si GSAP falla o el usuario pidió menos movimiento, el contenido queda visible; nada se oculta por CSS.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroIntro } from './motion/hero';
import { marquee } from './motion/marquee';
import { pointerEffects } from './motion/pointer';
import { scrollEffects } from './motion/scroll';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const mm = gsap.matchMedia();
mm.add({ ok: '(prefers-reduced-motion: no-preference)', fine: '(hover: hover) and (pointer: fine)' }, (ctx) => {
  const { ok, fine } = ctx.conditions as { ok: boolean; fine: boolean };
  if (!ok) return;
  document.documentElement.classList.add('has-motion');
  heroIntro();
  marquee();
  scrollEffects();
  if (fine) pointerEffects();

  // Las fuentes y las imágenes cambian la altura de la página: se recalculan las posiciones.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  return () => document.documentElement.classList.remove('has-motion');
});
