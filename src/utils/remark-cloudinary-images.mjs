import { visit } from 'unist-util-visit';

/**
 * Remark plugin to transform local image paths to Cloudinary URLs in MDX
 */
export function remarkCloudinaryImages() {
  return function transformer(tree) {
    visit(tree, 'image', (node) => {
      const { url } = node;
      
      // Skip if already a Cloudinary URL or external URL
      if (url.includes('cloudinary.com') || url.startsWith('http')) {
        return;
      }
      
      // Transform local paths to Cloudinary URLs
      // Assumes images are uploaded to Cloudinary with the blog/ prefix
      if (url.startsWith('/images/') || url.startsWith('./') || url.startsWith('../')) {
        const imageName = url
          .split('/')
          .pop()
          .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
        
        // Use Cloudinary URL with auto format and quality
        node.url = `https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/${imageName}`;
      }
    });
  };
}