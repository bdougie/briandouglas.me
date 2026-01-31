import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
    // Get all posts from content collection
    const posts = await getCollection('posts');

    // Filter drafts and sort by date (newest first)
    const sortedPosts = posts
        .filter(post => !post.data.draft)
        .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

    // Generate llms.txt content following llmstxt.org format
    const siteUrl = site?.toString() || 'https://briandouglas.me';

    const content = `# Brian Douglas

> A blog about software engineering, developer experience, open source, and building with AI

This site contains technical writing on web development, developer tools, and AI agents.

## Recent Posts

${sortedPosts.slice(0, 10).map((post) => {
    // Extract slug from post.slug (format: YYYY-MM-DD-title)
    const [year, month, day, ...titleParts] = post.slug.split('-');
    const slug = titleParts.join('-');
    const url = `${siteUrl}posts/${year}/${month}/${day}/${slug}/`;

    return `- [${post.data.title}](${url}) - ${post.data.description || ''}`;
}).join('\n')}

## All Posts

${sortedPosts.map((post) => {
    const [year, month, day, ...titleParts] = post.slug.split('-');
    const slug = titleParts.join('-');
    const url = `${siteUrl}posts/${year}/${month}/${day}/${slug}/`;
    const date = new Date(post.data.date).toISOString().split('T')[0];

    return `
## ${post.data.title}

- URL: ${url}
- Published: ${date}
- Description: ${post.data.description || post.data.title}
`;
}).join('\n')}

## About

Brian Douglas is a developer advocate, open source contributor, and founder. He writes about developer tools, AI agents, and building better software experiences.

## Contact

- Website: ${siteUrl}
- Twitter: @bdougieyo
- GitHub: @bdougie
`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        },
    });
};