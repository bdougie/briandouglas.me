#!/usr/bin/env node

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
// You can set these as environment variables or update here
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
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node upload-to-cloudinary.js <image-path> [public-id]');
    console.log('Example: node upload-to-cloudinary.js public/images/performance-metrics.png performance-metrics-bundle-optimization');
    process.exit(1);
  }
  
  const imagePath = args[0];
  const publicId = args[1] || path.basename(imagePath, path.extname(imagePath));
  
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    process.exit(1);
  }
  
  uploadImage(imagePath, publicId);
}

module.exports = { uploadImage };