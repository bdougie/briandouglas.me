import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/pages/posts');

// Regex to match markdown image syntax
const imageRegex = /!\[([^\]]*)\]\(([^)]+\.(png|jpg|jpeg|gif|webp))\)/g;

async function migrateImages() {
  console.log('🔄 Starting blog image migration to Cloudinary...');
  
  try {
    const files = await fs.readdir(postsDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let totalImages = 0;
    let migratedImages = 0;
    
    for (const file of mdFiles) {
      const filePath = path.join(postsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      let updatedContent = content;
      let hasChanges = false;
      
      // Find all image references
      const matches = Array.from(content.matchAll(imageRegex));
      
      for (const match of matches) {
        totalImages++;
        const [fullMatch, altText, imageSrc] = match;
        
        // Only migrate local images that start with /img/uploads, /images, or /gifs
        if (imageSrc.startsWith('/img/uploads') || imageSrc.startsWith('/images') || imageSrc.startsWith('/gifs')) {
          // Convert to OptimizedImage component syntax
          const optimizedImageTag = `<OptimizedImage src="${imageSrc}" alt="${altText}" />`;
          
          updatedContent = updatedContent.replace(fullMatch, optimizedImageTag);
          hasChanges = true;
          migratedImages++;
          
          console.log(`  ✅ ${file}: Migrated ${imageSrc}`);
        }
      }
      
      // Add import statement if we made changes
      if (hasChanges) {
        // Check if OptimizedImage import already exists
        if (!updatedContent.includes('import OptimizedImage')) {
          // Add import after frontmatter
          const frontmatterEnd = updatedContent.indexOf('---', 4) + 3;
          if (frontmatterEnd > 3) {
            const beforeFrontmatter = updatedContent.slice(0, frontmatterEnd);
            const afterFrontmatter = updatedContent.slice(frontmatterEnd);
            updatedContent = beforeFrontmatter + '\n\nimport OptimizedImage from \'../../components/OptimizedImage.astro\';\n' + afterFrontmatter;
          }
        }
        
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        console.log(`  📝 Updated ${file}`);
      }
    }
    
    console.log(`\n🎉 Migration complete!`);
    console.log(`📊 Stats: ${migratedImages}/${totalImages} images migrated`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

migrateImages();