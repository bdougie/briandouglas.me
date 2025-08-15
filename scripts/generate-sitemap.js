import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://briandouglas.me';

async function generateSitemap() {
  const distPath = path.join(__dirname, '..', 'dist');
  const publicPath = path.join(__dirname, '..', 'public');
  
  const links = [];
  
  // Add homepage
  links.push({
    url: '/',
    changefreq: 'weekly',
    priority: 1.0
  });
  
  // Add posts page
  links.push({
    url: '/posts/',
    changefreq: 'daily',
    priority: 0.9
  });
  
  // Get all post files from dist directory
  const postsPath = path.join(distPath, 'posts');
  
  if (fs.existsSync(postsPath)) {
    const files = fs.readdirSync(postsPath);
    
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const slug = file.replace('.html', '');
        // Skip index file
        if (slug !== 'index') {
          links.push({
            url: `/posts/${slug}/`,
            changefreq: 'monthly',
            priority: 0.7
          });
        }
      }
    });
  }
  
  // Create sitemap
  const stream = new SitemapStream({ hostname: SITE_URL });
  const data = await streamToPromise(Readable.from(links).pipe(stream));
  
  // Write sitemap to public folder
  const sitemapPath = path.join(publicPath, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, data.toString());
  
  console.log(`Sitemap generated successfully with ${links.length} URLs`);
  console.log(`Sitemap saved to: ${sitemapPath}`);
}

generateSitemap().catch(console.error);