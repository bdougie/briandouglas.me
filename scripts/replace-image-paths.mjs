#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog';
const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images');
const UPLOAD_CACHE_FILE = path.join(__dirname, '../.cloudinary-uploads.json');
const RASTER_IMAGE_PATTERN = /\.(png|jpg|jpeg|gif|webp)$/i;

// Track replacements for reporting
const replacements = [];

/**
 * Get all MDX and MD files in the posts directory
 */
function getPostFiles() {
  return glob.sync('**/*.{mdx,md}', {
    cwd: POSTS_DIR,
    absolute: true
  });
}

/**
 * Check if an image exists in public/images
 */
function stripQueryAndHash(imagePath) {
  return imagePath.split(/[?#]/, 1)[0];
}

function resolvePublicImagePath(imagePath, publicImagesDir = PUBLIC_IMAGES_DIR) {
  const cleanPath = stripQueryAndHash(imagePath.trim());
  let relativePath;

  if (cleanPath.startsWith('/public/images/')) {
    relativePath = cleanPath.slice('/public/images/'.length);
  } else if (cleanPath.startsWith('/images/')) {
    relativePath = cleanPath.slice('/images/'.length);
  } else if (cleanPath.startsWith('../images/')) {
    relativePath = cleanPath.slice('../images/'.length);
  } else if (cleanPath.startsWith('./')) {
    relativePath = cleanPath.slice(2);
  } else {
    relativePath = cleanPath;
  }

  const resolvedPath = path.resolve(publicImagesDir, relativePath);
  const publicRoot = path.resolve(publicImagesDir);
  if (!resolvedPath.startsWith(`${publicRoot}${path.sep}`)) return null;

  return resolvedPath;
}

function imageExists(imagePath, publicImagesDir = PUBLIC_IMAGES_DIR) {
  const resolvedPath = resolvePublicImagePath(imagePath, publicImagesDir);
  return Boolean(resolvedPath && fs.existsSync(resolvedPath));
}

function loadUploadCache() {
  try {
    if (fs.existsSync(UPLOAD_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(UPLOAD_CACHE_FILE, 'utf8'));
    }
  } catch {
    console.log('⚠️  Could not read the Cloudinary upload cache');
  }
  return {};
}

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function getUploadedCloudinaryUrl(imagePath, uploadCache, publicImagesDir = PUBLIC_IMAGES_DIR) {
  const cleanPath = stripQueryAndHash(imagePath);
  if (!RASTER_IMAGE_PATTERN.test(cleanPath)) return null;

  const localPath = resolvePublicImagePath(cleanPath, publicImagesDir);
  if (!localPath || !fs.existsSync(localPath)) return null;

  const imageName = getImageName(cleanPath);
  const cacheEntry = uploadCache[imageName];
  if (!cacheEntry || cacheEntry.hash !== getFileHash(localPath)) return null;

  return `${CLOUDINARY_BASE_URL}/${imageName}`;
}

/**
 * Extract image name from path
 */
function getImageName(imagePath) {
  // Remove leading slashes and directory paths
  const filename = path.basename(stripQueryAndHash(imagePath));
  // Remove extension
  return filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
}

/**
 * Check if a hostname is a valid Cloudinary domain
 */
function isCloudinaryHostname(hostname) {
  return hostname === 'res.cloudinary.com' || hostname.endsWith('.cloudinary.com');
}

/**
 * Check if a markdown image URL is already a remote or Cloudinary URL
 * Extracts the URL from ![alt](url) syntax and checks the URL itself
 */
function isRemoteOrCloudinaryUrl(markdownImage) {
  // Extract the URL from markdown image syntax ![...](url)
  const urlMatch = markdownImage.match(/\]\(([^)]+)\)/);
  if (!urlMatch) return false;

  const url = urlMatch[1];

  // Check if it's already a Cloudinary URL or any remote HTTP(S) URL
  if (url.startsWith(CLOUDINARY_BASE_URL)) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsedUrl = new URL(url);
      return isCloudinaryHostname(parsedUrl.hostname) || true; // Any remote URL should be skipped
    } catch {
      return false; // Invalid URL, treat as local
    }
  }
  return false;
}

/**
 * Check if an image path (from HTML src attribute) is a remote or Cloudinary URL
 */
function isRemoteOrCloudinaryPath(imagePath) {
  // If not an absolute URL, it's a local path - not remote
  if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
    return false;
  }

  // It's an absolute URL - parse it to check the host
  try {
    const url = new URL(imagePath);
    // Check if it's specifically Cloudinary or any remote host
    return isCloudinaryHostname(url.hostname) || true; // Any absolute URL should be skipped
  } catch {
    // If URL parsing fails, treat as local (conservative approach)
    return false;
  }
}

/**
 * Replace local image paths with Cloudinary URLs in a file
 */
function replaceImagePaths(filePath, options = {}) {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const uploadCache = options.uploadCache || loadUploadCache();
  const publicImagesDir = options.publicImagesDir || PUBLIC_IMAGES_DIR;

  let changesMade = false;

  // Pattern 1: Markdown images with /public/images/ or /images/ paths
  content = content.replace(
    /!\[([^\]]*)\]\((\/public\/images\/|\/images\/)([^)]+)\)/g,
    (match, altText, pathPrefix, imagePath) => {
      if (isRemoteOrCloudinaryUrl(match)) {
        return match;
      }
      const fullImagePath = pathPrefix + imagePath;
      const cloudinaryUrl = getUploadedCloudinaryUrl(fullImagePath, uploadCache, publicImagesDir);
      if (cloudinaryUrl) {
        replacements.push({ file: fileName, original: match, replaced: `![${altText}](${cloudinaryUrl})` });
        changesMade = true;
        return `![${altText}](${cloudinaryUrl})`;
      }
      console.log(`⚠️  Image was not uploaded; keeping local path: ${fullImagePath} (in ${fileName})`);
      return match;
    }
  );

  // Pattern 2: Markdown images with relative paths
  content = content.replace(
    /!\[([^\]]*)\]\((\.\/|\.\.\/images\/)([^)]+\.(png|jpg|jpeg|gif|webp))\)/gi,
    (match, altText, pathPrefix, imagePath) => {
      if (isRemoteOrCloudinaryUrl(match)) {
        return match;
      }
      const fullImagePath = pathPrefix + imagePath;
      const cloudinaryUrl = getUploadedCloudinaryUrl(fullImagePath, uploadCache, publicImagesDir);
      if (cloudinaryUrl) {
        replacements.push({ file: fileName, original: match, replaced: `![${altText}](${cloudinaryUrl})` });
        changesMade = true;
        return `![${altText}](${cloudinaryUrl})`;
      }
      console.log(`⚠️  Image was not uploaded; keeping local path: ${fullImagePath} (in ${fileName})`);
      return match;
    }
  );

  // Pattern 3: HTML <img> tags with /images/ src
  content = content.replace(
    /<img\s+([^>]*?)src=["'](\/images\/)([^"']+)["']([^>]*?)\/?>/gi,
    (match, before, pathPrefix, imagePath, after) => {
      // Construct the full src path and check if it's already remote/Cloudinary
      const fullSrcPath = pathPrefix + imagePath;
      if (isRemoteOrCloudinaryPath(fullSrcPath)) {
        return match;
      }
      const cloudinaryUrl = getUploadedCloudinaryUrl(fullSrcPath, uploadCache, publicImagesDir);
      if (cloudinaryUrl) {
        const replaced = match.replace(fullSrcPath, cloudinaryUrl);
        replacements.push({ file: fileName, original: match, replaced });
        changesMade = true;
        return replaced;
      }
      if (imageExists(fullSrcPath, publicImagesDir) && !RASTER_IMAGE_PATTERN.test(stripQueryAndHash(fullSrcPath))) {
        return match;
      }
      console.log(`⚠️  Image was not uploaded; keeping local path: ${fullSrcPath} (in ${fileName})`);
      return match;
    }
  );

  // Only write if changes were made
  if (changesMade) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${fileName}`);
    return true;
  }

  return false;
}

/**
 * Main function to process all posts
 */
function main() {
  console.log('🔄 Replacing local image paths with Cloudinary URLs...\n');
  
  const postFiles = getPostFiles();
  console.log(`📝 Found ${postFiles.length} post files to process\n`);
  
  let filesUpdated = 0;
  const uploadCache = loadUploadCache();
  
  for (const file of postFiles) {
    if (replaceImagePaths(file, { uploadCache })) {
      filesUpdated++;
    }
  }
  
  // Report results
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${postFiles.length}`);
  console.log(`   Files updated: ${filesUpdated}`);
  console.log(`   Total replacements: ${replacements.length}`);
  
  if (replacements.length > 0) {
    console.log('\n📝 Replacements made:');
    replacements.forEach(r => {
      console.log(`\n   File: ${r.file}`);
      console.log(`   From: ${r.original}`);
      console.log(`   To:   ${r.replaced}`);
    });
  }
  
  console.log('\n✨ Image path replacement complete!\n');
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {
  getImageName,
  getUploadedCloudinaryUrl,
  imageExists,
  replaceImagePaths,
  resolvePublicImagePath,
  stripQueryAndHash
};
