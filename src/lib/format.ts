export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

export const formatCount = (value: number) => new Intl.NumberFormat('es-AR').format(value);
