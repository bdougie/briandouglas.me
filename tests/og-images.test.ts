import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
// @ts-expect-error - plain JS module without types
import { generateOGImage } from '../scripts/lib/og-generator.mjs';

/**
 * OG images are generated at build time by src/pages/og/[...slug].png.ts,
 * so a card exists for every post the moment a deploy goes live.
 * These tests validate the renderer and the slug scheme without network access.
 */

function getSlugFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.(mdx?|md)$/, '');
  const withoutDate = withoutExt.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return withoutDate;
}

function isDraft(content: string): boolean {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return false;
  return /^draft:\s*(true|"true"|'true')/m.test(frontmatterMatch[1]);
}

function getTitle(content: string): string | undefined {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return undefined;
  const match = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
  if (!match) return undefined;
  let value = match[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

function getPublishedPosts(): { slug: string; title: string }[] {
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  const posts: { slug: string; title: string }[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    if (isDraft(content)) continue;
    const title = getTitle(content);
    if (title) posts.push({ slug: getSlugFromFilename(file), title });
  }
  return posts;
}

describe('OG images', () => {
  it('has no duplicate post slugs (each card needs a unique /og/ path)', () => {
    const slugs = getPublishedPosts().map(p => p.slug);
    const duplicates = slugs.filter((slug, i) => slugs.indexOf(slug) !== i);
    expect(duplicates, `Duplicate slugs would collide in /og/: ${duplicates.join(', ')}`).toHaveLength(0);
  });

  it('renders a valid 1200x630 PNG for the default card', async () => {
    const png = await generateOGImage({ title: 'bdougie on the internet' });
    const meta = await sharp(png).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
  });

  it('renders valid cards for recent post titles', async () => {
    const posts = getPublishedPosts().slice(-3);
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      const png = await generateOGImage({ title: post.title });
      const meta = await sharp(png).metadata();
      expect(meta.width, `bad card for "${post.title}"`).toBe(1200);
      expect(meta.height, `bad card for "${post.title}"`).toBe(630);
    }
  }, 30000);

  it('renders long and special-character titles without throwing', async () => {
    const titles = [
      'My OpenClaw Was Spending $80 a Day to Read My Email & Other "Stories" — a very long title that should wrap onto several lines without breaking the renderer',
      "It's a test: 100% coverage?",
    ];
    for (const title of titles) {
      const png = await generateOGImage({ title });
      const meta = await sharp(png).metadata();
      expect(meta.width).toBe(1200);
    }
  }, 30000);
});
