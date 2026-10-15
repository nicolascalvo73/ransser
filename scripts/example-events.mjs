// Genera src/data/events.json con eventos de EJEMPLO (fechas futuras relativas a hoy) y sus imágenes de mentira.
// Uso: npm run events:example   (sobrescribe events.json: no usar con eventos reales cargados)
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const pad = (n) => String(n).padStart(2, '0');
const iso = (base, days, hh, mm) => {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(hh)}:${pad(mm)}:00-03:00`;
};

// Base: el próximo sábado a partir de hoy (a las 00:00 UTC, sólo se usa la parte de fecha).
const today = new Date();
const base = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
base.setUTCDate(base.getUTCDate() + (((6 - base.getUTCDay() + 7) % 7) || 7));

const events = [
  { id: 'ejemplo-rodada-caminos-de-tierra', tipo: 'rodada', titulo: 'Rodada por caminos de tierra', fecha: iso(base, 7, 9, 0), lugar: 'Plaza principal', ciudad: 'Ciudad de ejemplo', provincia: 'Santa Fe', descripcion: 'Salida grupal por caminos de tierra, ida y vuelta en el día. Nos juntamos en la plaza antes de arrancar.', tieneStand: true, linkInfo: 'https://example.com/rodada-de-ejemplo', imagen: 'evento-ejemplo-1', destacado: true, ejemplo: true },
  { id: 'ejemplo-motoencuentro-primavera', tipo: 'motoencuentro', titulo: 'Motoencuentro de primavera', fecha: iso(base, 14, 10, 0), fechaFin: iso(base, 15, 18, 0), lugar: 'Predio del lago', ciudad: 'Ciudad de ejemplo', provincia: 'Córdoba', descripcion: 'Dos días de motos, comida y buena onda. Pasá por el stand a probarte las camperas y ver el camping.', tieneStand: true, linkInfo: 'https://example.com/motoencuentro-de-ejemplo', imagen: 'evento-ejemplo-2', destacado: false, ejemplo: true },
  { id: 'ejemplo-ride-camping', tipo: 'ride', titulo: 'Ride de camping', fecha: iso(base, 21, 8, 30), lugar: 'Camping municipal', ciudad: 'Ciudad de ejemplo', provincia: 'Buenos Aires', descripcion: 'Salimos juntos, armamos campamento y volvemos al día siguiente. Llevá carpa, bolsa de dormir y ganas.', tieneStand: false, destacado: false, ejemplo: true },
  { id: 'ejemplo-rodada-cierre-de-temporada', tipo: 'rodada', titulo: 'Rodada de cierre de temporada', fecha: iso(base, 35, 15, 0), lugar: 'Club de motos', ciudad: 'Ciudad de ejemplo', provincia: 'Entre Ríos', descripcion: 'Una vuelta tranquila para despedir la temporada. Todas las motos y todos los niveles son bienvenidos.', tieneStand: false, destacado: false, ejemplo: true },
  { id: 'ejemplo-motoencuentro-fin-de-anio', tipo: 'motoencuentro', titulo: 'Motoencuentro de fin de año', fecha: iso(base, 49, 11, 0), lugar: 'Predio ferial', ciudad: 'Ciudad de ejemplo', provincia: 'Santa Fe', descripcion: 'Cierre del año con rodada y encuentro. Ransser lleva el stand con camperas, pantalones y camping.', tieneStand: true, imagen: 'evento-ejemplo-3', destacado: false, ejemplo: true },
];
await writeFile('src/data/events.json', JSON.stringify(events, null, 2) + '\n');

// Imágenes de mentira (800x500): rayas, rombo naranja y el rótulo "imagen de ejemplo".
const mock = (label, variant) => Buffer.from(`<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#17191b"/>
  <defs><pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(${variant === 2 ? -45 : 45})"><rect width="14" height="28" fill="#1c1f21"/></pattern></defs>
  <rect width="800" height="500" fill="url(#p)"/>
  <rect x="${variant === 1 ? 0 : 560}" y="0" width="240" height="500" fill="#ff6b1a" opacity="0.12"/>
  <rect x="${variant === 3 ? 520 : 90}" y="150" width="120" height="120" fill="#ff6b1a" transform="rotate(45 ${variant === 3 ? 580 : 150} 210)"/>
  <text x="40" y="410" font-family="Arial, sans-serif" font-weight="800" font-size="54" fill="#f1f0ea">${label}</text>
  <text x="40" y="455" font-family="monospace" font-size="20" letter-spacing="3" fill="#a4a6a1">IMAGEN DE EJEMPLO</text>
</svg>`);
const labels = ['RODADA', 'MOTOENCUENTRO', 'ENCUENTRO'];
for (const [i, label] of labels.entries()) {
  await sharp(mock(label, i + 1)).webp({ quality: 80 }).toFile(`src/assets/images/evento-ejemplo-${i + 1}.webp`);
}
console.log('events.json + 3 imágenes de ejemplo generados');
