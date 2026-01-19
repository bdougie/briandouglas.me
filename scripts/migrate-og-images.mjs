#!/usr/bin/env node

/**
 * ONE-TIME MIGRATION SCRIPT
 * Generate and upload OG images for all existing blog posts
 *
 * Usage:
 *   node scripts/migrate-og-images.mjs
 *
 * Options:
 *   --dry-run     Generate images locally but don't upload
 *   --limit=N     Only process N posts (for testing)
 *   --skip=N      Skip first N posts (for resuming)
 *   --force       Re-upload even if already exists
 *
 * After running this script successfully, you can delete it.
 * Use generate-og-image.mjs for new posts going forward.
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

// Track progress
const PROGRESS_FILE = path.join(__dirname, '../.og-migration-progress.json');

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (error) {
    console.log('Starting fresh migration...');
  }
  return { completed: [], failed: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

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

// Check if image already exists on Cloudinary
async function imageExists(publicId) {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch (error) {
    if (error.error?.http_code === 404) {
      return false;
    }
    throw error;
  }
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

// Get all post files
function getAllPosts() {
  const postsDir = path.join(__dirname, '../src/content/posts');
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .sort();

  return files.map(filename => {
    const filepath = path.join(postsDir, filename);
    const content = fs.readFileSync(filepath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    const slug = getSlugFromFilename(filename);

    return {
      filename,
      filepath,
      slug,
      title: frontmatter.title,
      draft: frontmatter.draft === 'true' || frontmatter.draft === true
    };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));

  const dryRun = flags.includes('--dry-run');
  const force = flags.includes('--force');

  const limitFlag = flags.find(f => f.startsWith('--limit='));
  const limit = limitFlag ? parseInt(limitFlag.split('=')[1], 10) : Infinity;

  const skipFlag = flags.find(f => f.startsWith('--skip='));
  const skip = skipFlag ? parseInt(skipFlag.split('=')[1], 10) : 0;

  console.log('🚀 OG Image Migration Script');
  console.log('============================\n');

  if (!dryRun && (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    console.error('❌ Cloudinary credentials not found');
    console.error('   Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables');
    console.error('   Or use --dry-run to test locally');
    process.exit(1);
  }

  // Get all posts
  const allPosts = getAllPosts();
  const publishedPosts = allPosts.filter(p => !p.draft && p.title);

  console.log(`📚 Found ${publishedPosts.length} published posts with titles`);

  if (skip > 0) {
    console.log(`⏭️  Skipping first ${skip} posts`);
  }
  if (limit < Infinity) {
    console.log(`🔢 Limiting to ${limit} posts`);
  }
  if (dryRun) {
    console.log(`🧪 DRY RUN - images will be saved locally, not uploaded`);
  }
  if (force) {
    console.log(`💪 FORCE - will re-upload even if image exists`);
  }

  console.log('\n');

  // Load progress
  const progress = loadProgress();
  const postsToProcess = publishedPosts.slice(skip, skip + limit);

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let uploaded = 0;

  for (const post of postsToProcess) {
    const publicId = getOGPublicId(post.slug);

    // Skip if already completed (unless force)
    if (!force && progress.completed.includes(post.slug)) {
      console.log(`⏭️  [${processed + 1}/${postsToProcess.length}] ${post.slug} (already done)`);
      skipped++;
      processed++;
      continue;
    }

    console.log(`\n📝 [${processed + 1}/${postsToProcess.length}] ${post.filename}`);
    console.log(`   Title: ${post.title}`);
    console.log(`   Slug: ${post.slug}`);

    try {
      // Check if already exists on Cloudinary
      if (!force && !dryRun) {
        const exists = await imageExists(publicId);
        if (exists) {
          console.log(`   ✓ Already exists on Cloudinary`);
          progress.completed.push(post.slug);
          saveProgress(progress);
          skipped++;
          processed++;
          continue;
        }
      }

      // Generate OG image
      console.log(`   🎨 Generating image...`);
      const imageBuffer = await generateOGImage({
        title: post.title,
        site: 'briandouglas.me'
      });
      console.log(`   Generated ${(imageBuffer.length / 1024).toFixed(1)}KB PNG`);

      if (dryRun) {
        // Save locally for dry run
        const localDir = path.join(__dirname, '../public/og');
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        fs.writeFileSync(path.join(localDir, `${post.slug}.png`), imageBuffer);
        console.log(`   💾 Saved to public/og/${post.slug}.png`);
      } else {
        // Upload to Cloudinary
        console.log(`   ☁️  Uploading to Cloudinary...`);
        await uploadToCloudinary(imageBuffer, publicId);
        console.log(`   ✅ Uploaded: ${publicId}`);
      }

      progress.completed.push(post.slug);
      saveProgress(progress);
      uploaded++;

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      progress.failed.push({ slug: post.slug, error: error.message });
      saveProgress(progress);
      failed++;
    }

    processed++;

    // Small delay to avoid rate limiting
    if (!dryRun) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n============================');
  console.log('📊 Migration Summary');
  console.log('============================');
  console.log(`   Total processed: ${processed}`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Skipped (already done): ${skipped}`);
  console.log(`   Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed posts:');
    progress.failed.forEach(f => {
      console.log(`   - ${f.slug}: ${f.error}`);
    });
  }

  if (progress.completed.length === publishedPosts.length) {
    console.log('\n✨ Migration complete! All posts have OG images.');
    console.log('   You can now delete this script and .og-migration-progress.json');
  } else {
    const remaining = publishedPosts.length - progress.completed.length;
    console.log(`\n⏳ ${remaining} posts remaining. Run the script again to continue.`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
