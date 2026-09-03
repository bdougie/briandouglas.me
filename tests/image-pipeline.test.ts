import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  extractLocalImageReferences,
  resolvePublicImagePath as resolveUploadImagePath
} from '../scripts/upload-blog-images.mjs';
import { getImageName, replaceImagePaths } from '../scripts/replace-image-paths.mjs';

const temporaryDirectories: string[] = [];
const publicImagesDir = join(process.cwd(), 'public/images');

function makeTemporaryFile(content: string) {
  const directory = mkdtempSync(join(tmpdir(), 'image-pipeline-'));
  temporaryDirectories.push(directory);
  const filePath = join(directory, 'post.md');
  writeFileSync(filePath, content);
  return filePath;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('Cloudinary image pipeline', () => {
  it('finds nested images in Markdown and HTML, including cache-busted paths', () => {
    const content = `
![Chart](/images/chart.png)
<img src="/images/blog/frame.png?v=2" alt="Frame" />
<source srcset="/images/blog/diagram.svg?v=2" />
`;

    expect(extractLocalImageReferences(content)).toEqual([
      '/images/chart.png',
      '/images/blog/frame.png',
      '/images/blog/diagram.svg'
    ]);
  });

  it('removes query strings before creating a Cloudinary public ID', () => {
    expect(getImageName('/images/blog/pokemon-heist-brock.png?v=2')).toBe('pokemon-heist-brock');
  });

  it('resolves a nested image reference inside public/images', () => {
    expect(resolveUploadImagePath('/images/blog/pokemon-heist-flail.png', publicImagesDir)).toBe(
      join(publicImagesDir, 'blog/pokemon-heist-flail.png')
    );
  });

  it('rewrites only a raster image whose exact contents were uploaded', () => {
    const localImagePath = join(publicImagesDir, 'blog/pokemon-heist-brock.png');
    const hash = createHash('sha256').update(readFileSync(localImagePath)).digest('hex');
    const filePath = makeTemporaryFile(`
<img src="/images/blog/pokemon-heist-brock.png?v=2" alt="Brock" />
<img src="/images/blog/sweeper-crew.svg?v=2" alt="Diagram" />
`);

    replaceImagePaths(filePath, {
      publicImagesDir,
      uploadCache: {
        'pokemon-heist-brock': { hash, url: 'https://example.com/uploaded.png' }
      }
    });

    const result = readFileSync(filePath, 'utf8');
    expect(result).toContain('https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/pokemon-heist-brock');
    expect(result).toContain('/images/blog/sweeper-crew.svg?v=2');
  });

  it('keeps a local path when no successful upload is recorded', () => {
    const filePath = makeTemporaryFile('<img src="/images/blog/pokemon-heist-flail.png" alt="Flail" />');

    replaceImagePaths(filePath, { publicImagesDir, uploadCache: {} });

    expect(readFileSync(filePath, 'utf8')).toContain('/images/blog/pokemon-heist-flail.png');
  });
});
