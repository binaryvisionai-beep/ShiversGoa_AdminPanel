import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");
const svg = await readFile(join(publicDir, "pwa-icon.svg"));

await mkdir(iconsDir, { recursive: true });

const sizes = [
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32x32.png", size: 32 },
];

for (const { name, size } of sizes) {
  const out = join(publicDir, name);
  await sharp(svg).resize(size, size).png().toFile(out);
}

await sharp(svg).resize(32, 32).toFile(join(publicDir, "favicon.ico"));

console.log("PWA icons generated in public/");
