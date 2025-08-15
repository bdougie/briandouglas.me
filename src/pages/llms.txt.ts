import type { APIRoute } from 'astro';

// Import all markdown files using Vite's import.meta.glob
const posts = import.meta.glob('./posts/*.md', { eager: true });

export const GET: APIRoute = async () => {
    // Convert the posts object to an array and extract frontmatter
    const postArray = Object.entries(posts).map(([filepath, post]: [string, any]) => {
        return {
            filepath,
            frontmatter: post.frontmatter,
            compiledContent: post.compiledContent || post.default || '',
            rawContent: post.rawContent || ''
        };
    });
    
    // Sort posts by date (newest first)
    const sortedPosts = postArray.sort((a, b) => 
        new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );
    
    // Generate llms.txt content
    const content = `# Brian Douglas Blog

Welcome to briandouglas.me - A blog about software engineering, developer relations, and technology.

${sortedPosts
    .map((post) => {
        // Extract filename to create the URL slug
        const filename = post.filepath.split('/').pop() || '';
        const [year, month, day, ...titleParts] = filename.replace('.md', '').split('-');
        const slug = `${year}/${month}/${day}/${titleParts.join('-')}`;
        
        // Get the content - prefer rawContent, fallback to compiledContent
        let postContent = post.rawContent || 
                          (typeof post.compiledContent === 'function' ? post.compiledContent() : post.compiledContent) || 
                          'Content not available';
        
        // Clean up the content - replace literal \n with actual line breaks
        if (typeof postContent === 'string') {
            postContent = postContent.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        }
        
        return `## ${post.frontmatter.title}

URL: https://briandouglas.me/posts/${slug}/
Date: ${post.frontmatter.date}
${post.frontmatter.description ? `Description: ${post.frontmatter.description}\n` : ''}
---

${postContent}

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