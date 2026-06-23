import sharp from "sharp";

// Remove o fundo xadrez (pixels claros e sem cor) do logo, gerando PNG transparente.
const src = "client/public/logo-10anos.webp";
const out = "client/public/logo-10anos.png";

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const ch = info.channels;

for (let i = 0; i < data.length; i += ch) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const lum = max / 255;
  const sat = max === 0 ? 0 : (max - min) / max;
  // claro e sem cor (branco/cinza do xadrez) => transparente
  if (lum > 0.7 && sat < 0.18) data[i + 3] = 0;
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
  .png()
  .toFile(out);
console.log("PNG transparente gerado:", out);
