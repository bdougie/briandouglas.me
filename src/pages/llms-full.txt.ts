import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
    const posts = await getCollection('posts');

    const sortedPosts = posts
        .filter(post => !post.data.draft)
        .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

    const siteUrl = site?.toString() || 'https://briandouglas.me';

    const content = `# Brian Douglas - Full Content

> A blog about software engineering, developer experience, open source, and building with AI

${sortedPosts.map((post) => {
    const [year, month, day, ...titleParts] = post.slug.split('-');
    const slug = titleParts.join('-');
    const url = `${siteUrl}posts/${year}/${month}/${day}/${slug}/`;
    const date = new Date(post.data.date).toISOString().split('T')[0];

    return `---

## ${post.data.title}

- URL: ${url}
- Published: ${date}

${post.body}`;
}).join('\n\n')}
`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        },
    });
};
