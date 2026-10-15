// Filtro por tipo de la sección Eventos. Mejora progresiva: sin JS la barra queda oculta y se ven todos.
const root = document.querySelector<HTMLElement>('[data-events]');
const bar = root?.querySelector<HTMLElement>('[data-filters]');

if (root && bar) {
  const chips = [...bar.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-evento-item]')];
  const none = root.querySelector<HTMLElement>('[data-events-none]');
  const live = root.querySelector<HTMLElement>('[data-events-live]');
  const LABEL: Record<string, string> = { todos: 'todos los eventos', rodada: 'rodadas', motoencuentro: 'motoencuentros', ride: 'rides' };

  bar.hidden = false;

  const apply = (filter: string) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
    let shown = 0;
    items.forEach((li) => {
      const show = filter === 'todos' || li.dataset.tipo === filter;
      li.hidden = !show;
      if (show) {
        shown++;
        // Si el movimiento (GSAP) ya había preparado la card, se limpia para que no quede invisible.
        const card = li.firstElementChild as HTMLElement | null;
        if (card) {
          card.style.opacity = '';
          card.style.transform = '';
        }
      }
    });
    if (none) none.hidden = shown > 0;
    if (live) live.textContent = shown > 0 ? `Mostrando ${shown} ${LABEL[filter]}.` : `No hay ${LABEL[filter]} por ahora.`;
    // El alto de la página cambió: motion.ts recalcula las posiciones de scroll.
    window.dispatchEvent(new CustomEvent('events:filtered'));
  };

  bar.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (chip?.dataset.filter) apply(chip.dataset.filter);
  });
}
