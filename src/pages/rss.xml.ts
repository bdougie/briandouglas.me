import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await import.meta.glob('./posts/**/*.md', { eager: true });
  
  const items = Object.entries(posts)
    .map(([path, post]: [string, any]) => {
      const filename = path.split('/').pop()!;
      const [year, month, day, ...titleParts] = filename.replace('.md', '').split('-');
      const slug = `${year}/${month}/${day}/${titleParts.join('-')}`;
      
      // Ensure all required fields are present and valid
      if (!post.frontmatter.title || !post.frontmatter.date) {
        return null;
      }
      
      return {
        title: String(post.frontmatter.title),
        description: String(post.frontmatter.description || post.frontmatter.title),
        link: `/posts/${slug}/`,
        pubDate: new Date(post.frontmatter.date + 'T00:00:00'),
        draft: post.frontmatter.draft || false
      };
    })
    .filter(item => item !== null && !item.draft)
    .sort((a, b) => b!.pubDate.getTime() - a!.pubDate.getTime());

  return rss({
    title: 'Brian Douglas',
    description: 'A blog about software development, open source, and developer experience',
    site: context.site?.toString() || 'https://briandouglas.me',
    items: items.map(({ draft, ...item }) => item) as any[],
    customData: `<language>en-us</language>`,
  });
}