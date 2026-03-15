import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function parsePostSlug(slug: string) {
    const match = slug.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
    if (!match) return null;
    return { year: match[1], month: match[2], day: match[3], titleSlug: match[4] };
}

export const GET: APIRoute = async ({ site }) => {
    try {
        const posts = await getCollection('posts');
        const siteUrl = site?.toString() || 'https://briandouglas.me';

        const sortedPosts = posts
            .filter(post => !post.data.draft)
            .map(post => {
                const parsed = parsePostSlug(post.slug);
                return { ...post, parsed };
            })
            .filter(post => post.parsed !== null)
            .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

        const postUrl = (post: typeof sortedPosts[number]) =>
            `${siteUrl}posts/${post.parsed!.year}/${post.parsed!.month}/${post.parsed!.day}/${post.parsed!.titleSlug}/`;

        const content = `# Brian Douglas

> A blog about software engineering, developer experience, open source, and building with AI

This site contains technical writing on web development, developer tools, and AI agents.

For full post content, see: ${siteUrl}llms-full.txt

## Recent Posts

${sortedPosts.slice(0, 10).map((post) =>
    `- [${post.data.title}](${postUrl(post)}) - ${post.data.description || ''}`
).join('\n')}

## All Posts

${sortedPosts.map((post) => {
    const date = new Date(post.data.date).toISOString().split('T')[0];
    return `
## ${post.data.title}

- URL: ${postUrl(post)}
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
    } catch (e) {
        const fallback = `# Brian Douglas

> A blog about software engineering, developer experience, open source, and building with AI

Visit https://briandouglas.me for all posts.

- Website: https://briandouglas.me
- Twitter: @bdougieyo
- GitHub: @bdougie
`;
        return new Response(fallback, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=60'
            },
        });
    }
};