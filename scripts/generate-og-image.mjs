// Builds the social share card (1200×630) from the hero image:
//   node scripts/generate-og-image.mjs
// Writes src/app/opengraph-image.jpg + twitter-image.jpg, which Next.js turns into
// og:image / twitter:image tags. Re-run after changing the hero image or headline.
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;

// Hind Siliguri = the site font; Pango/HarfBuzz in sharp shape Bengali conjuncts correctly.
const fontDir = join(tmpdir(), 'paniwala-og-fonts');
async function font(weight) {
  const file = join(fontDir, `HindSiliguri-${weight}.ttf`);
  if (!existsSync(file)) {
    mkdirSync(fontDir, { recursive: true });
    const res = await fetch(`https://github.com/google/fonts/raw/main/ofl/hindsiliguri/HindSiliguri-${weight}.ttf`);
    if (!res.ok) throw new Error(`Font download failed: ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

async function text(markup, weight, size, width) {
  const { data, info } = await sharp({
    text: {
      text: markup,
      font: `Hind Siliguri ${weight} ${size}`,
      fontfile: await font(weight),
      width,
      dpi: 72,
      rgba: true,
      spacing: 0,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { input: data, height: info.height, width: info.width };
}

const background = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ecfeff"/>
      <stop offset="0.55" stop-color="#f0f9ff"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.76" cy="0.5" r="0.42" gradientTransform="translate(0.76 0.5) scale(1 1.9) translate(-0.76 -0.5)">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="#0891b2" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="#0891b2"/>
</svg>`);

const PAD = 64;
const COL = 600; // left text column width

const hero = await sharp(join(root, 'src/assets/hero-image.png')).resize({ height: 590 }).toBuffer({ resolveWithObject: true });
const logo = await sharp(join(root, 'src/assets/logo.png')).resize(76, 76).toBuffer();

const brand = await text('<span foreground="#0f172a">পানি ওয়ালা</span>', 'Bold', 40, 480);
// Hind Siliguri's built-in line gap is very tall, so stack lines at an explicit line height.
async function stack(rows, weight, size, lineHeight) {
  const rendered = await Promise.all(rows.map(([color, str]) => text(`<span foreground="${color}">${str}</span>`, weight, size, COL)));
  const step = Math.round(size * lineHeight);
  return {
    layers: (left, top) => rendered.map((r, i) => ({ input: r.input, left, top: top + i * step })),
    height: step * (rows.length - 1) + rendered.at(-1).height,
  };
}

const headline = await stack(
  [
    ['#0f172a', 'বাসা ও অফিসের জন্য'],
    ['#0284c7', '১০০% বিশুদ্ধ ও নিরাপদ'],
    ['#0f172a', 'খাবার পানি'],
  ],
  'Bold',
  58,
  1.32,
);
const sub = await stack(
  [
    ['#475569', 'নিরাপদ ও বিশুদ্ধ পানির বিশ্বস্ত সরবরাহ'],
    ['#475569', 'খুলনা শহরে ফ্রি হোম ডেলিভারি'],
  ],
  'Medium',
  26,
  1.45,
);
const price = await text('<span foreground="#ffffff">২০ লিটার জার মাত্র ৳৪০</span>', 'Bold', 28, 500);

const pillW = price.width + 48;
const pillH = price.height + 20;
const pill = Buffer.from(
  `<svg width="${pillW}" height="${pillH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="${pillH / 2}" fill="#0891b2"/></svg>`,
);

// Vertically centre the left column.
const blockH = 76 + 30 + headline.height + 22 + sub.height + 34 + pillH;
let y = Math.round((H - blockH) / 2) - 4;
const layers = [];
layers.push({ input: logo, left: PAD, top: y });
layers.push({ input: brand.input, left: PAD + 76 + 16, top: y + Math.round((76 - brand.height) / 2) });
y += 76 + 30;
layers.push(...headline.layers(PAD, y));
y += headline.height + 22;
layers.push(...sub.layers(PAD, y));
y += sub.height + 34;
layers.push({ input: pill, left: PAD, top: y });
layers.push({ input: price.input, left: PAD + 24, top: y + 10 });
layers.push({ input: hero.data, left: W - hero.info.width - 40, top: Math.round((H - hero.info.height) / 2) - 4 });

const out = join(root, 'src/app/opengraph-image.jpg');
await sharp(background)
  .composite(layers)
  .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(out);
copyFileSync(out, join(root, 'src/app/twitter-image.jpg'));

const { size } = await import('node:fs').then((fs) => fs.statSync(out));
console.log(`Wrote ${out} (${Math.round(size / 1024)} KB)`);
