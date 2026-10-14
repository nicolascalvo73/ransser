// Convierte raw/*.{jpg,jpeg,png} a WebP optimizado en src/assets/images/ y genera favicon + og-image.
// Uso: npm run images
import { readdir, mkdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const RAW = 'raw';
const OUT = 'src/assets/images';
const BG = '#0e0f10';

await mkdir(OUT, { recursive: true });

for (const file of await readdir(RAW)) {
  const { name, ext } = parse(file);
  if (!/^\.(jpe?g|png)$/i.test(ext)) continue;
  // Logo de 100 px: sin reescalar, calidad alta (es plano y chico).
  const quality = name === 'logo' ? 95 : 80;
  const info = await sharp(join(RAW, file)).webp({ quality, effort: 6 }).toFile(join(OUT, `${name}.webp`));
  console.log(`${name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
}

// Favicons a partir del logo real.
await sharp(join(RAW, 'logo.jpg')).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(join(RAW, 'logo.jpg')).resize(96, 96).png().toFile('public/favicon-96.png');

// og-image 1200x630: foto real a la derecha, logo y leyenda a la izquierda.
const photo = await sharp(join(RAW, 'hero-ruta.jpg')).resize(630, 630, { fit: 'cover' }).toBuffer();
// El avatar de Instagram se muestra recortado en círculo: se replica la máscara.
const mask = Buffer.from('<svg width="180" height="180"><circle cx="90" cy="90" r="90"/></svg>');
const logo = await sharp(join(RAW, 'logo.jpg')).resize(180, 180).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
const text = Buffer.from(`<svg width="570" height="300" xmlns="http://www.w3.org/2000/svg">
  <style>
    .t { font: 800 50px 'Arial Narrow', 'Liberation Sans Narrow', Arial, sans-serif; fill: #f1efea; }
    .s { font: 500 28px Arial, sans-serif; fill: #a7abae; }
  </style>
  <text x="0" y="60" class="t">Indumentaria y</text>
  <text x="0" y="120" class="t">accesorios para</text>
  <text x="0" y="180" class="t">moteros</text>
  <text x="0" y="240" class="s">Envíos a todo el país</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: BG } })
  .composite([
    { input: photo, left: 570, top: 0 },
    { input: logo, left: 48, top: 48 },
    { input: text, left: 48, top: 270 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('og-image.jpg, favicons ok');
