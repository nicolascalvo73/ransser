import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/*.webp', { eager: true });

/** Devuelve la imagen de src/assets/images por nombre de archivo, sin extensión. */
export const getImage = (name: string): ImageMetadata => {
  const entry = modules[`/src/assets/images/${name}.webp`];
  if (!entry) throw new Error(`Imagen no encontrada: ${name}.webp`);
  return entry.default;
};
