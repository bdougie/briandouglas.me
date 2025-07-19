import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    // Get all blog posts
    const posts = await Astro.glob('./posts/*.md');
    
    // Sort posts by date (newest first)
    const sortedPosts = posts.sort((a, b) => 
        new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );
    
    // Generate llms.txt content
    const content = `# Brian Douglas Blog

Welcome to briandouglas.me - A blog about software engineering, developer relations, and technology.

${sortedPosts
    .map((post) => {
        // Extract filename to create the URL slug
        const filename = post.file.split('/').pop();
        const [year, month, day, ...titleParts] = filename.replace('.md', '').split('-');
        const slug = `${year}/${month}/${day}/${titleParts.join('-')}`;
        
        return `## ${post.frontmatter.title}

URL: https://briandouglas.me/posts/${slug}/
Date: ${post.frontmatter.date}
${post.frontmatter.description ? `Description: ${post.frontmatter.description}\n` : ''}
---

${post.compiledContent()}

---`;
    })
    .join('\n\n')}`;
    
    return new Response(content, {
        headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        },
    });
};