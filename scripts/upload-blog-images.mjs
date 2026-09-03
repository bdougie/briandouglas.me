#!/usr/bin/env node

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images');
const RASTER_IMAGE_PATTERN = /\.(png|jpg|jpeg|gif|webp)$/i;

// Configure Cloudinary - these should be set as env vars in Netlify
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bdougie',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Track uploaded images to avoid re-uploading
const UPLOAD_CACHE_FILE = path.join(__dirname, '../.cloudinary-uploads.json');

function loadUploadCache() {
  try {
    if (fs.existsSync(UPLOAD_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(UPLOAD_CACHE_FILE, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️  Could not load upload cache, starting fresh');
  }
  return {};
}

function saveUploadCache(cache) {
  fs.writeFileSync(UPLOAD_CACHE_FILE, JSON.stringify(cache, null, 2));
}

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function stripQueryAndHash(imagePath) {
  return imagePath.split(/[?#]/, 1)[0];
}

function normalizeLocalImageReference(imagePath) {
  const cleanPath = stripQueryAndHash(imagePath.trim());

  if (cleanPath.startsWith('/public/images/')) {
    return cleanPath.slice('/public'.length);
  }
  if (cleanPath.startsWith('/images/')) {
    return cleanPath;
  }
  if (cleanPath.startsWith('../images/')) {
    return `/images/${cleanPath.slice('../images/'.length)}`;
  }
  if (cleanPath.startsWith('./')) {
    return `/images/${cleanPath.slice(2)}`;
  }

  return null;
}

function extractLocalImageReferences(content) {
  const references = new Set();
  const addReference = (imagePath) => {
    const normalized = normalizeLocalImageReference(imagePath);
    if (normalized) references.add(normalized);
  };

  for (const match of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+['"][^)]*['"])?\)/g)) {
    addReference(match[1]);
  }

  for (const match of content.matchAll(/<(?:img|source)\b[^>]*?\b(?:src|srcset)=['"]([^'"]+)['"][^>]*>/gi)) {
    for (const candidate of match[1].split(',')) {
      addReference(candidate.trim().split(/\s+/, 1)[0]);
    }
  }

  return [...references];
}

function resolvePublicImagePath(imageReference, publicImagesDir = PUBLIC_IMAGES_DIR) {
  const normalized = normalizeLocalImageReference(imageReference);
  if (!normalized) return null;

  const relativePath = normalized.slice('/images/'.length);
  const resolvedPath = path.resolve(publicImagesDir, relativePath);
  const publicRoot = path.resolve(publicImagesDir);

  if (!resolvedPath.startsWith(`${publicRoot}${path.sep}`)) {
    return null;
  }

  return resolvedPath;
}

async function uploadImage(imagePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: 'blog',
      overwrite: true,
      resource_type: 'image',
      // Add transformations for optimization
      eager: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    console.log(`✅ Uploaded: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to upload ${publicId}:`, error.message);
    throw error;
  }
}

async function processLocalImages(imageReferences) {
  const uploadCache = loadUploadCache();

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    console.log('📁 No public/images directory found');
    return;
  }

  const references = imageReferences || await scanBlogPosts();
  const imageFiles = [...new Set(references
    .map(reference => resolvePublicImagePath(reference))
    .filter(Boolean)
    .filter(imagePath => RASTER_IMAGE_PATTERN.test(imagePath))
    .filter(imagePath => fs.existsSync(imagePath)))];

  console.log(`🔍 Found ${imageFiles.length} referenced raster images in public/images`);

  for (const imagePath of imageFiles) {
    const publicId = path.basename(imagePath, path.extname(imagePath));
    const fileHash = getFileHash(imagePath);

    // Check if already uploaded with same hash
    if (uploadCache[publicId] && uploadCache[publicId].hash === fileHash) {
      console.log(`⏭️  Skipping ${publicId} (already uploaded)`);
      continue;
    }

    try {
      const result = await uploadImage(imagePath, publicId);
      uploadCache[publicId] = {
        hash: fileHash,
        url: result.secure_url,
        uploadedAt: new Date().toISOString()
      };
      saveUploadCache(uploadCache);
    } catch (error) {
      console.error(`Failed to upload ${publicId}, continuing...`);
    }
  }

  console.log('✨ Image upload complete');
}

async function scanBlogPosts() {
  const posts = fs.readdirSync(POSTS_DIR).filter(file =>
    file.endsWith('.mdx') || file.endsWith('.md')
  );

  const localImages = new Set();
  
  for (const post of posts) {
    const content = fs.readFileSync(path.join(POSTS_DIR, post), 'utf8');
    for (const imagePath of extractLocalImageReferences(content)) {
      localImages.add(imagePath);
    }
  }

  if (localImages.size > 0) {
    console.log(`📝 Found ${localImages.size} local image references in blog posts:`);
    localImages.forEach(imagePath => console.log(`   - ${imagePath}`));
  }

  return [...localImages];
}

async function main() {
  console.log('🚀 Starting Cloudinary image upload for build...');
  
  // Check if credentials are available
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('⚠️  Cloudinary credentials not found in environment');
    console.log('   Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Netlify environment variables');
    console.log('   Skipping automatic image upload...');
    return;
  }

  try {
    // Scan blog posts for local images
    const referencedImages = await scanBlogPosts();
    
    // Upload images from public/images
    await processLocalImages();
    
    console.log('✅ Build-time image upload complete');
  } catch (error) {
    console.error('❌ Error during image upload:', error);
    // Don't fail the build for image upload issues
    process.exit(0);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {
  extractLocalImageReferences,
  normalizeLocalImageReference,
  processLocalImages,
  resolvePublicImagePath,
  scanBlogPosts,
  uploadImage
};
