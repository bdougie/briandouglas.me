import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const CLOUDINARY_OG_BASE = 'https://res.cloudinary.com/bdougie/image/upload/og';

/**
 * Get slug from post filename
 * e.g., "2026-01-18-for-every-ralph-there-needs-to-be-a-super-nintendo.mdx"
 *    -> "for-every-ralph-there-needs-to-be-a-super-nintendo"
 */
function getSlugFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.(mdx?|md)$/, '');
  const withoutDate = withoutExt.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return withoutDate;
}

/**
 * Parse frontmatter to check if post is a draft
 */
function isDraft(content: string): boolean {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return false;

  const frontmatter = frontmatterMatch[1];
  return /^draft:\s*(true|"true"|'true')/m.test(frontmatter);
}

/**
 * Get all published post slugs
 */
function getPublishedPostSlugs(): string[] {
  const postsDir = path.join(process.cwd(), 'src/content/posts');

  if (!fs.existsSync(postsDir)) {
    return [];
  }

  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  const slugs: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    if (!isDraft(content)) {
      slugs.push(getSlugFromFilename(file));
    }
  }

  return slugs;
}

/**
 * Check if an OG image exists on Cloudinary (returns 200)
 */
async function checkOGImageExists(slug: string): Promise<{ exists: boolean; status: number }> {
  const url = `${CLOUDINARY_OG_BASE}/${slug}.png`;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return { exists: response.ok, status: response.status };
  } catch (error) {
    return { exists: false, status: 0 };
  }
}

describe('OG Images', () => {
  it('should have a default OG image on Cloudinary', async () => {
    const result = await checkOGImageExists('default');
    expect(result.exists, `Default OG image not found (status: ${result.status})`).toBe(true);
  });

  it('should have OG images for all published posts', async () => {
    const slugs = getPublishedPostSlugs();
    const missing: string[] = [];

    // Check all posts in parallel with concurrency limit
    const results = await Promise.all(
      slugs.map(async (slug) => {
        const result = await checkOGImageExists(slug);
        return { slug, ...result };
      })
    );

    for (const result of results) {
      if (!result.exists) {
        missing.push(`${result.slug} (status: ${result.status})`);
      }
    }

    expect(
      missing,
      `Missing OG images for ${missing.length} posts:\n  - ${missing.join('\n  - ')}\n\nRun: npm run og:generate -- <slug>`
    ).toHaveLength(0);
  }, 60000); // 60s timeout for network requests
});
