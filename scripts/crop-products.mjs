// Recorta las fotos de producto desde las capturas del catálogo de WhatsApp (img/) a 4:5, resolución nativa, WebP.
// Uso: npm run crop   (img/ no se versiona; el resultado va a src/assets/images/)
import sharp from 'sharp';

const SRC = (n) => `img/WhatsApp Image 2026-10-14 at ${n}.jpeg`;
const OUT = 'src/assets/images';

// Fichas del catálogo (720 px de ancho): la foto ocupa y=78..795 y trae encima la flecha "volver" (arriba a la izquierda).
const FICHA = { left: 0, top: 78, width: 557, height: 696, patchArrow: true };

const JOBS = [
  { id: 'carpa-2-personas', file: '17.53.15', ...FICHA },
  { id: 'tarp-toldo', file: '17.53.16 (1)', ...FICHA },
    { id: 'bolsa-de-dormir', file: '17.53.16', ...FICHA, patchWeight: true, arrowFrom: { left: 24, top: 190 } },
  { id: 'combo-tarp-bolsa', file: '17.53.28 (1)', left: 0, top: 350, width: 720, height: 900 },
  { id: 'pantalon-4-estaciones-softshell', file: '17.53.26', left: 0, top: 300, width: 720, height: 900 },
  { id: 'chaleco-ruta-40', file: '17.53.17 (2)', ...FICHA },
  { id: 'campera-softshell-4-estaciones', file: '17.53.17 (3)', ...FICHA },
  { id: 'camisa-con-proteccion', file: '17.53.17', ...FICHA, arrowFrom: { left: 24, top: 170 } },
  { id: 'outlet-campera-4-estaciones', file: '17.53.19 (2)', ...FICHA },
  { id: 'outlet-campera-4-estaciones-reflectiva', file: '17.53.19 (1)', ...FICHA },
  { id: 'outlet-campera-mujer-4-estaciones', file: '17.53.18 (2)', ...FICHA },
  // Captura de baja resolución (242 px de ancho): es la única foto disponible de la hamaca.
  { id: 'hamaca-paraguaya', file: '17.53.26 (2)', left: 0, top: 205, width: 242, height: 302 },
];

// Máscara con bordes difuminados para que los parches no se noten.
const feather = (w, h, inset, blur) =>
  Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="b"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="#fff" filter="url(#b)"/></svg>`);

// Cubre `box` con una copia desenfocada de `from` (misma medida), mezclada con borde suave.
const softPatch = async (base, box, from, sigma, srcHeight = box.height) => {
  const src = await sharp(base).extract({ ...from, width: box.width, height: srcHeight }).resize(box.width, box.height, { fit: 'fill' }).blur(sigma).ensureAlpha().toBuffer();
  const input = await sharp(src).composite([{ input: feather(box.width, box.height, 6, 3), blend: 'dest-in' }]).png().toBuffer();
  return { input, left: box.left, top: box.top };
};

// Flecha "volver" de la app, arriba a la izquierda de las fichas.
const arrowPatch = (base, from = { left: 78, top: 108 }) => softPatch(base, { left: 24, top: 108, width: 48, height: 44 }, from, 3);

// "Peso: 900 kg" está impreso en la foto de la bolsa (dato erróneo): se tapa con el piso contiguo.
const weightPatch = (base) => softPatch(base, { left: 20, top: 690, width: 330, height: 64 }, { left: 20, top: 744 }, 6, 28);

for (const { id, file, patchArrow, patchWeight, arrowFrom, ...rect } of JOBS) {
  const path = SRC(file);
  let img = sharp(path);
  if (patchArrow) {
    const base = await sharp(path).toBuffer();
    const patches = [await arrowPatch(base, arrowFrom)];
    if (patchWeight) patches.push(await weightPatch(base));
    img = sharp(base).composite(patches);
  }
  const info = await sharp(await img.toBuffer()).extract(rect).webp({ quality: 82, effort: 6 }).toFile(`${OUT}/${id}.webp`);
  console.log(`${id}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}
