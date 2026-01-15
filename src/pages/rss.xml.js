import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  
  const items = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
    .map(post => {
      const [year, month, day, ...titleParts] = post.slug.split('-');
      const slug = `${year}/${month}/${day}/${titleParts.join('-')}`;

      let description = post.data.description || post.data.title;
      if (typeof description !== 'string' || description === '>-' || description.trim() === '') {
        description = post.data.title;
      }

      return {
        title: post.data.title,
        description: description,
        link: `/posts/${slug}/`,
        pubDate: new Date(post.data.date),
      };
    });

  return rss({
    title: 'Brian Douglas',
    description: 'A blog about software development, open source, and developer experience',
    site: context.site?.toString() || 'https://briandouglas.me',
    items: items,
    customData: `<language>en-us</language>`,
  });
}
