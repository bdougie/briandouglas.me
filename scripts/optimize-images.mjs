import imagemin from 'imagemin';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function optimizeImages() {
  console.log('🖼️  Optimizing images in public folder...');
  
  const publicDir = path.join(projectRoot, 'public');
  const tempDir = path.join(projectRoot, '.temp-images');
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    const files = await imagemin([`${publicDir}/**/*.{jpg,jpeg,png,gif,svg}`], {
      destination: tempDir,
      plugins: [
        imageminGifsicle({
          optimizationLevel: 3,
          interlaced: true,
          colors: 256
        }),
        imageminMozjpeg({
          quality: 85,
          progressive: true
        }),
        imageminPngquant({
          quality: [0.7, 0.9],
          speed: 4,
          strip: true
        }),
        imageminSvgo({
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false
                }
              }
            }
          ]
        })
      ]
    });
    
    for (const file of files) {
      const relativePath = path.relative(tempDir, file.destinationPath);
      const originalPath = path.join(publicDir, relativePath);
      
      try {
        const originalStats = await fs.stat(originalPath);
        const optimizedStats = await fs.stat(file.destinationPath);
        
        const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);
        
        if (optimizedStats.size < originalStats.size) {
          await fs.copyFile(file.destinationPath, originalPath);
          console.log(`✅ ${relativePath}: ${savings}% smaller`);
        } else {
          console.log(`⏭️  ${relativePath}: Already optimized`);
        }
      } catch (err) {
        // Skip files that don't exist in the original location
        console.log(`⚠️  ${relativePath}: Skipping (file not found in original location)`);
      }
    }
    
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log('🎉 Image optimization complete!');
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    process.exit(1);
  }
}

async function generateWebP() {
  console.log('🎨 Generating WebP versions...');
  
  const publicDir = path.join(projectRoot, 'public');
  
  try {
    const webpFiles = await imagemin([`${publicDir}/**/*.{jpg,jpeg,png}`], {
      destination: publicDir,
      plugins: [
        imageminWebp({
          quality: 85,
          method: 6
        })
      ]
    });
    
    console.log(`✅ Generated ${webpFiles.length} WebP versions`);
  } catch (error) {
    console.error('❌ Error generating WebP:', error);
  }
}

async function main() {
  await optimizeImages();
  
  if (process.argv.includes('--webp')) {
    await generateWebP();
  }
}

main();