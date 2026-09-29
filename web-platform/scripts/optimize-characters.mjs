import sharp from "sharp";
import { mkdir, writeFile, stat } from "node:fs/promises";
const mapping = {
  "Aldar_kose.png": "aldar-kose",
  "Er_tostik.png": "er-tostik",
  "Tazsha_bala.png": "tazsha-bala",
  "Ayaz_bi.png": "ayaz-bi",
  "Zhirenshe.png": "zhirenshe",
  "Maqta_qyz.png": "makta-kyz",
  "Qozhanasyr.png": "kozhanasyr",
  "Qanbaq_shal.png": "kanbak-shal",
};
await mkdir("public/characters", { recursive: true });
const manifest = [];
for (const [file, slug] of Object.entries(mapping)) {
  const input = "assets/characters-original/" + file;
  const metadata = await sharp(input).metadata();
  for (const width of [480, 960]) {
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 })
      .toFile("public/characters/" + slug + "-" + width + ".webp");
  }
  manifest.push({
    original: file,
    slug,
    width: metadata.width,
    height: metadata.height,
    originalBytes: (await stat(input)).size,
    webBytes: (await stat("public/characters/" + slug + "-960.webp")).size,
  });
}
await writeFile(
  "assets/characters-manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(
  JSON.stringify({
    images: manifest.length,
    originalBytes: manifest.reduce((n, v) => n + v.originalBytes, 0),
    webBytes: manifest.reduce((n, v) => n + v.webBytes, 0),
  }),
);
