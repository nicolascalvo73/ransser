/** Prefija rutas internas con `base` (GitHub Pages sirve bajo /ransser). */
export const withBase = (path = '/') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
