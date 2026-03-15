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

        const content = `# Brian Douglas - Full Content

> A blog about software engineering, developer experience, open source, and building with AI

${sortedPosts.map((post) => {
    const url = `${siteUrl}posts/${post.parsed!.year}/${post.parsed!.month}/${post.parsed!.day}/${post.parsed!.titleSlug}/`;
    const date = new Date(post.data.date).toISOString().split('T')[0];

    return `---

## ${post.data.title}

- URL: ${url}
- Published: ${date}

${post.body || ''}`;
}).join('\n\n')}
`;

        return new Response(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            },
        });
    } catch (e) {
        const fallback = `# Brian Douglas - Full Content

> A blog about software engineering, developer experience, open source, and building with AI

Content temporarily unavailable. Visit https://briandouglas.me for all posts.
`;
        return new Response(fallback, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=60'
            },
        });
    }
};
