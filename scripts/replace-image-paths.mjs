#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog';
const POSTS_DIR = path.join(__dirname, '../src/pages/posts');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images');

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
function imageExists(imageName) {
  const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  
  for (const ext of extensions) {
    const imagePath = path.join(PUBLIC_IMAGES_DIR, imageName + ext);
    if (fs.existsSync(imagePath)) {
      return true;
    }
  }
  
  // Check if the name already has an extension
  if (fs.existsSync(path.join(PUBLIC_IMAGES_DIR, imageName))) {
    return true;
  }
  
  return false;
}

/**
 * Extract image name from path
 */
function getImageName(imagePath) {
  // Remove leading slashes and directory paths
  const filename = path.basename(imagePath);
  // Remove extension
  return filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
}

/**
 * Replace local image paths with Cloudinary URLs in a file
 */
function replaceImagePaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  const fileName = path.basename(filePath);
  
  // Patterns to match:
  // 1. /public/images/something.png
  // 2. /images/something.png
  // 3. ./something.png or ../images/something.png (relative paths)
  
  const patterns = [
    // Match markdown images with /public/images/ or /images/ paths
    /!\[([^\]]*)\]\((\/public\/images\/|\/images\/)([^)]+)\)/g,
    // Match markdown images with relative paths
    /!\[([^\]]*)\]\((\.\/|\.\.\/images\/)([^)]+\.(png|jpg|jpeg|gif|webp))\)/g,
  ];
  
  let changesMade = false;
  
  for (const pattern of patterns) {
    content = content.replace(pattern, (match, altText, pathPrefix, imagePath) => {
      // Skip if already a Cloudinary URL or external URL
      if (match.includes('cloudinary.com') || match.includes('http')) {
        return match;
      }
      
      // Extract the image name
      const imageName = getImageName(imagePath);
      
      // Check if the image exists in public/images
      if (imageExists(imageName) || imageExists(imagePath)) {
        const cloudinaryUrl = `${CLOUDINARY_BASE_URL}/${imageName}`;
        
        replacements.push({
          file: fileName,
          original: match,
          replaced: `![${altText}](${cloudinaryUrl})`
        });
        
        changesMade = true;
        return `![${altText}](${cloudinaryUrl})`;
      }
      
      // If image doesn't exist, leave it unchanged
      console.log(`⚠️  Image not found in public/images: ${imagePath} (in ${fileName})`);
      return match;
    });
  }
  
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
  
  for (const file of postFiles) {
    if (replaceImagePaths(file)) {
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

export { replaceImagePaths, getImageName };