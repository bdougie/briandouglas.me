#!/usr/bin/env node

import satori from 'satori';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load font for satori - using Inter as a clean, modern font
async function loadFont() {
  // Try to load a local font first (check for both woff2 and ttf)
  const fontPathWoff2 = path.join(__dirname, '../../public/fonts/Inter-Bold.woff2');
  const fontPathTtf = path.join(__dirname, '../../public/fonts/Inter-Bold.ttf');

  if (fs.existsSync(fontPathWoff2)) {
    return fs.readFileSync(fontPathWoff2);
  }

  if (fs.existsSync(fontPathTtf)) {
    return fs.readFileSync(fontPathTtf);
  }

  // Fetch Inter Bold from Google Fonts API (TTF format)
  const fontUrl = 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf';

  console.log('   Downloading font from Google Fonts...');
  const response = await fetch(fontUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
  }

  const fontBuffer = await response.arrayBuffer();

  // Validate it's actually a font file (TTF starts with 0x00010000 or 'true' or 'typ1')
  const bytes = new Uint8Array(fontBuffer);
  if (bytes[0] === 0x3C) {
    // Starts with '<' - probably HTML error page
    throw new Error('Font URL returned HTML instead of font data');
  }

  // Cache the font locally
  const fontsDir = path.join(__dirname, '../../public/fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }
  fs.writeFileSync(fontPathTtf, Buffer.from(fontBuffer));
  console.log('   Font downloaded and cached locally');

  return Buffer.from(fontBuffer);
}

// Format title to title case
function toTitleCase(str) {
  // Words that should stay lowercase (unless first word)
  const lowercaseWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in'];

  return str.split(' ').map((word, index) => {
    const lower = word.toLowerCase();
    if (index > 0 && lowercaseWords.includes(lower)) {
      return lower;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

// Split title into lines for better display
function splitTitleIntoLines(title, maxCharsPerLine = 20) {
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  // Limit to 4 lines max
  return lines.slice(0, 4);
}

/**
 * Generate an OG image for a blog post
 * @param {Object} options
 * @param {string} options.title - The post title
 * @param {string} options.site - The site name (default: briandouglas.me)
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function generateOGImage({ title, site = 'briandouglas.me' }) {
  const font = await loadFont();

  const formattedTitle = toTitleCase(title);
  const lines = splitTitleIntoLines(formattedTitle, 20);

  // Create the SVG using satori
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#000000',
          padding: '60px 80px',
        },
        children: [
          // Title lines
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              },
              children: lines.map(line => ({
                type: 'div',
                props: {
                  style: {
                    fontSize: '72px',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.1,
                  },
                  children: line,
                },
              })),
            },
          },
          // Site name at bottom
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '60px',
                left: '80px',
                fontSize: '28px',
                color: '#888888',
              },
              children: site,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  // Convert SVG to PNG using sharp
  const png = await sharp(Buffer.from(svg))
    .png({ quality: 90 })
    .toBuffer();

  return png;
}

/**
 * Generate slug from post filename
 * @param {string} filename - e.g., "2026-01-18-for-every-ralph-there-needs-to-be-a-super-nintendo.mdx"
 * @returns {string} - e.g., "for-every-ralph-there-needs-to-be-a-super-nintendo"
 */
export function getSlugFromFilename(filename) {
  // Remove extension
  const withoutExt = filename.replace(/\.(mdx?|md)$/, '');
  // Remove date prefix (YYYY-MM-DD-)
  const withoutDate = withoutExt.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return withoutDate;
}

/**
 * Get the Cloudinary public ID for an OG image
 * @param {string} slug - The post slug
 * @returns {string} - The Cloudinary public ID
 */
export function getOGPublicId(slug) {
  return `og/${slug}`;
}
