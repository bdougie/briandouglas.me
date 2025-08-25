#!/usr/bin/env node

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bdougie',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImage(imagePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: 'blog',
      overwrite: true,
      resource_type: 'image'
    });
    
    console.log('✅ Image uploaded successfully!');
    console.log('Public URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Generate optimized URL
    const optimizedUrl = cloudinary.url(result.public_id, {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    console.log('Optimized URL:', optimizedUrl);
    
    return result;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    process.exit(1);
  }
}

// Command line usage
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: node upload-to-cloudinary.mjs <image-path> [public-id]');
  console.log('Example: node upload-to-cloudinary.mjs public/images/performance-metrics.png performance-metrics-bundle-optimization');
  console.log('\nNote: You need to set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables');
  process.exit(1);
}

const imagePath = args[0];
const publicId = args[1] || path.basename(imagePath, path.extname(imagePath));

if (!fs.existsSync(imagePath)) {
  console.error('❌ Image file not found:', imagePath);
  process.exit(1);
}

if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary credentials');
  console.error('Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables');
  console.error('\nFor now, you can manually upload the image to Cloudinary and use this URL format:');
  console.error(`https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/${publicId}`);
  process.exit(1);
}

uploadImage(imagePath, publicId);

export { uploadImage };