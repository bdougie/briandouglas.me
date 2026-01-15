import { describe, it, expect } from 'vitest';
import { GET } from '../src/pages/rss.xml.js';

describe('RSS Feed Generation', () => {
  it('should generate RSS feed efficiently', async () => {
    const start = performance.now();

    // Mock context
    const context = {
      site: new URL('https://example.com')
    };

    const response = await GET(context);

    const end = performance.now();
    const duration = end - start;

    console.log(`RSS Generation took ${duration.toFixed(2)}ms`);

    expect(response).toBeDefined();
    // Verify some content to ensure it actually worked
    const text = await response.text();
    expect(text).toContain('<rss');
    // Expect at least some items
    expect(text).toContain('<item>');
  }, 30000); // 30s timeout
});
