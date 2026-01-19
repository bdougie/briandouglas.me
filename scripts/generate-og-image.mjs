#!/usr/bin/env node

/**
 * Generate OG image for a single blog post
 *
 * Usage:
 *   node scripts/generate-og-image.mjs <slug-or-filename>
 *   node scripts/generate-og-image.mjs for-every-ralph-there-needs-to-be-a-super-nintendo
 *   node scripts/generate-og-image.mjs 2026-01-18-for-every-ralph-there-needs-to-be-a-super-nintendo.mdx
 *
 * Options:
 *   --dry-run    Generate image locally but don't upload to Cloudinary
 *   --local      Save image to public/og/ instead of uploading
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateOGImage, getSlugFromFilename, getOGPublicId } from './lib/og-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bdougie',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Parse frontmatter from markdown file
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

// Find post file by slug or filename
function findPostFile(slugOrFilename) {
  const postsDir = path.join(__dirname, '../src/content/posts');
  const files = fs.readdirSync(postsDir);

  // Try exact filename match first
  if (files.includes(slugOrFilename)) {
    return path.join(postsDir, slugOrFilename);
  }

  // Try matching by slug
  const slug = slugOrFilename.replace(/\.(mdx?|md)$/, '');
  for (const file of files) {
    const fileSlug = getSlugFromFilename(file);
    if (fileSlug === slug) {
      return path.join(postsDir, file);
    }
  }

  // Try partial match
  for (const file of files) {
    if (file.includes(slug)) {
      return path.join(postsDir, file);
    }
  }

  return null;
}

// Upload image buffer to Cloudinary
async function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        format: 'png',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));
  const positionalArgs = args.filter(a => !a.startsWith('--'));

  const dryRun = flags.includes('--dry-run');
  const saveLocal = flags.includes('--local');

  if (positionalArgs.length === 0) {
    console.log(`
Usage: node scripts/generate-og-image.mjs <slug-or-filename>

Examples:
  node scripts/generate-og-image.mjs for-every-ralph-there-needs-to-be-a-super-nintendo
  node scripts/generate-og-image.mjs 2026-01-18-for-every-ralph-there-needs-to-be-a-super-nintendo.mdx

Options:
  --dry-run    Generate image locally but don't upload to Cloudinary
  --local      Save image to public/og/ instead of uploading
    `);
    process.exit(1);
  }

  const slugOrFilename = positionalArgs[0];

  // Find the post file
  const postPath = findPostFile(slugOrFilename);
  if (!postPath) {
    console.error(`❌ Could not find post matching: ${slugOrFilename}`);
    process.exit(1);
  }

  const filename = path.basename(postPath);
  const slug = getSlugFromFilename(filename);
  console.log(`📝 Found post: ${filename}`);
  console.log(`   Slug: ${slug}`);

  // Read and parse frontmatter
  const content = fs.readFileSync(postPath, 'utf8');
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter.title) {
    console.error(`❌ Post has no title in frontmatter`);
    process.exit(1);
  }

  console.log(`   Title: ${frontmatter.title}`);

  // Generate OG image
  console.log(`\n🎨 Generating OG image...`);
  const imageBuffer = await generateOGImage({
    title: frontmatter.title,
    site: 'briandouglas.me'
  });
  console.log(`   Generated ${(imageBuffer.length / 1024).toFixed(1)}KB PNG`);

  // Save locally if requested
  if (saveLocal || dryRun) {
    const localDir = path.join(__dirname, '../public/og');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localPath = path.join(localDir, `${slug}.png`);
    fs.writeFileSync(localPath, imageBuffer);
    console.log(`💾 Saved locally: public/og/${slug}.png`);
  }

  // Upload to Cloudinary unless dry-run
  if (!dryRun && !saveLocal) {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error(`\n❌ Cloudinary credentials not found`);
      console.error(`   Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables`);
      console.error(`   Or use --local to save the image locally`);
      process.exit(1);
    }

    const publicId = getOGPublicId(slug);
    console.log(`\n☁️  Uploading to Cloudinary...`);
    console.log(`   Public ID: ${publicId}`);

    try {
      const result = await uploadToCloudinary(imageBuffer, publicId);
      console.log(`✅ Uploaded successfully!`);
      console.log(`   URL: ${result.secure_url}`);
      console.log(`\n📋 OG Image URL for meta tags:`);
      console.log(`   https://res.cloudinary.com/bdougie/image/upload/${publicId}.png`);
    } catch (error) {
      console.error(`❌ Upload failed:`, error.message);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
