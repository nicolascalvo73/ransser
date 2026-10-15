import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Marquee infinito; la velocidad acompaña a la del scroll. */
export const marquee = () => {
  const track = document.querySelector<HTMLElement>('[data-marquee]');
  if (!track) return;
  const tween = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      const dir = self.direction > 0 ? 1 : -1;
      const v = Math.min(Math.abs(self.getVelocity()) / 300, 5);
      gsap.to(tween, { timeScale: dir * (1 + v), duration: 0.2, overwrite: true });
      gsap.to(tween, { timeScale: dir, duration: 1, delay: 0.2 });
    },
  });
};
