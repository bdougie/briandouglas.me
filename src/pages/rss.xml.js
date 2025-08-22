import rss from '@astrojs/rss';

export async function GET(context) {
  const posts = import.meta.glob('./posts/*.md', { eager: true });
  
  const validItems = [];
  
  for (const [path, post] of Object.entries(posts)) {
    const filename = path.split('/').pop();
    
    // Skip special files
    if (filename.includes('.html.md')) {
      continue;
    }
    
    // Type guard - ensure post has frontmatter
    if (!post || typeof post !== 'object' || !('frontmatter' in post)) {
      continue;
    }
    
    const frontmatter = post.frontmatter;
    
    // Skip drafts
    if (frontmatter.draft) {
      continue;
    }
    
    // Ensure all required fields are present and valid
    if (!frontmatter.title || !frontmatter.date) {
      continue;
    }
    
    const [year, month, day, ...titleParts] = filename.replace('.md', '').split('-');
    const slug = `${year}/${month}/${day}/${titleParts.join('-')}`;
    
    // Handle description - use title as fallback
    let description = frontmatter.description || frontmatter.title;
    if (typeof description !== 'string' || description === '>-' || description.trim() === '') {
      description = frontmatter.title;
    }
    
    const pubDate = new Date(frontmatter.date);
    
    const item = {
      title: String(frontmatter.title).trim(),
      description: String(description).trim(),
      link: `https://briandouglas.me/posts/${slug}/`,
      pubDate: pubDate
    };
    
    // Validate the item has all required fields
    if (item.title && item.description && item.link && item.pubDate && !isNaN(item.pubDate.getTime())) {
      validItems.push(item);
    }
  }
  
  const items = validItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Brian Douglas',
    description: 'A blog about software development, open source, and developer experience',
    site: context.site?.toString() || 'https://briandouglas.me',
    items: items,
    customData: `<language>en-us</language>`,
  });
}