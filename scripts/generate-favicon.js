import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync('./public/images/favicon.svg', 'utf8');

// Generate PNG favicon
await sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toFile('./public/images/favicon.png');

console.log('Favicon PNG generated successfully!');

// Generate apple-touch-icon
await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile('./public/images/apple-touch-icon.png');

console.log('Apple touch icon generated successfully!');

// Generate various sizes for manifest
const sizes = [192, 512];
for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`./public/images/icon-${size}x${size}.png`);
  console.log(`Icon ${size}x${size} generated successfully!`);
}