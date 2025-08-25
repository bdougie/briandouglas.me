#!/usr/bin/env node

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function processLocalImages() {
  const uploadCache = loadUploadCache();
  const publicImagesDir = path.join(__dirname, '../public/images');
  
  if (!fs.existsSync(publicImagesDir)) {
    console.log('📁 No public/images directory found');
    return;
  }

  const imageFiles = fs.readdirSync(publicImagesDir).filter(file => 
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
  );

  console.log(`🔍 Found ${imageFiles.length} images in public/images`);

  for (const imageFile of imageFiles) {
    const imagePath = path.join(publicImagesDir, imageFile);
    const publicId = path.basename(imageFile, path.extname(imageFile));
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
  const postsDir = path.join(__dirname, '../src/pages/posts');
  const posts = fs.readdirSync(postsDir).filter(file => 
    file.endsWith('.mdx') || file.endsWith('.md')
  );

  const localImages = [];
  
  for (const post of posts) {
    const content = fs.readFileSync(path.join(postsDir, post), 'utf8');
    
    // Find local image references
    const imageMatches = content.matchAll(/!\[.*?\]\((\/images\/[^)]+)\)/g);
    for (const match of imageMatches) {
      localImages.push(match[1]);
    }
    
    // Find images in public/images referenced relatively
    const relativeMatches = content.matchAll(/!\[.*?\]\(\.\/([^)]+\.(png|jpg|jpeg|gif|webp))\)/gi);
    for (const match of relativeMatches) {
      localImages.push(`/images/${match[1]}`);
    }
  }

  if (localImages.length > 0) {
    console.log(`📝 Found ${localImages.length} local image references in blog posts:`);
    localImages.forEach(img => console.log(`   - ${img}`));
  }

  return localImages;
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

export { uploadImage, processLocalImages };