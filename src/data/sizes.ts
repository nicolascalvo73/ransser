/** Medidas que muestra la tabla de talles del catálogo (XS a 4XL). Valores de EJEMPLO en cm: reemplazar por la tabla real. */
export const SIZE_MEASURES = ['Largo de pecho', 'Ancho de hombros', 'Largo de manga', 'Largo de espalda'] as const;

export const SIZE_CHART: Record<string, readonly number[]> = {
  XS: [49, 41, 60, 66],
  S: [52, 43, 61, 68],
  M: [55, 45, 62, 70],
  L: [58, 47, 63, 72],
  XL: [61, 49, 64, 74],
  '2XL': [64, 51, 65, 76],
  '3XL': [67, 53, 66, 78],
  '4XL': [70, 55, 67, 80],
};
