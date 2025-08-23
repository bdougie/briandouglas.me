import { describe, it, expect } from 'vitest';
import {
  buildCloudinaryUrl,
  getCloudinaryImageUrl,
  getModernImageFormatsFromPath
} from './cloudinary';

/**
 * Bulletproof tests for Cloudinary utilities
 * Following principles from the blog post:
 * - No mocks (tests pure functions directly)
 * - Fast and isolated
 * - Focus on actual behavior, not implementation
 * - Simple and maintainable
 */

describe('Cloudinary Utilities - Bulletproof Tests', () => {
  describe('buildCloudinaryUrl - Pure Function Tests', () => {
    it('builds URL with default transformations', () => {
      const result = buildCloudinaryUrl('my-image');
      // Test the actual output, not mocked behavior
      expect(result).toEqual(
        'https://res.cloudinary.com/bdougie/image/upload/c_fill,g_auto,q_auto,f_auto,f_auto/my-image'
      );
    });

    it('applies width transformation correctly', () => {
      const result = buildCloudinaryUrl('test', { width: 800 });
      expect(result).toContain('w_800');
    });

    it('applies height transformation correctly', () => {
      const result = buildCloudinaryUrl('test', { height: 600 });
      expect(result).toContain('h_600');
    });

    it('combines multiple transformations', () => {
      const result = buildCloudinaryUrl('test', {
        width: 1200,
        height: 630,
        format: 'webp',
        quality: 85
      });
      
      // Verify each transformation is present
      expect(result).toContain('w_1200');
      expect(result).toContain('h_630');
      expect(result).toContain('f_webp');
      expect(result).toContain('q_85');
    });

    it('handles empty options gracefully', () => {
      const result = buildCloudinaryUrl('image', {});
      expect(result).toBeTruthy();
      expect(result).toContain('https://res.cloudinary.com/bdougie');
    });
  });

  describe('getCloudinaryImageUrl - Path Mapping Tests', () => {
    it('maps favicon.svg to correct Cloudinary path', () => {
      const result = getCloudinaryImageUrl('/images/favicon.svg');
      expect(result).toContain('briandouglas-me/favicon');
    });

    it('maps GIF files correctly', () => {
      const result = getCloudinaryImageUrl('/gifs/pr-cached.gif');
      expect(result).toContain('briandouglas-me/gifs/pr-cached');
    });

    it('returns original path for unmapped files', () => {
      const unknownPath = '/some/unknown/path.png';
      const result = getCloudinaryImageUrl(unknownPath);
      expect(result).toEqual(unknownPath);
    });

    it('applies transformations to mapped paths', () => {
      const result = getCloudinaryImageUrl('/images/favicon.png', {
        width: 32,
        height: 32
      });
      expect(result).toContain('w_32');
      expect(result).toContain('h_32');
      expect(result).toContain('briandouglas-me/favicon-png');
    });
  });

  describe('getModernImageFormatsFromPath - Format Generation Tests', () => {
    it('generates three format variants for known paths', () => {
      const result = getModernImageFormatsFromPath('/images/favicon.png');
      
      expect(result).toHaveProperty('webp');
      expect(result).toHaveProperty('avif');
      expect(result).toHaveProperty('original');
      
      expect(result.webp).toContain('f_webp');
      expect(result.avif).toContain('f_avif');
      expect(result.original).not.toContain('f_webp');
      expect(result.original).not.toContain('f_avif');
    });

    it('returns original path for all formats when unmapped', () => {
      const unknownPath = '/unknown/image.jpg';
      const result = getModernImageFormatsFromPath(unknownPath);
      
      expect(result.webp).toEqual(unknownPath);
      expect(result.avif).toEqual(unknownPath);
      expect(result.original).toEqual(unknownPath);
    });

    it('preserves options across all format variants', () => {
      const result = getModernImageFormatsFromPath('/images/favicon.png', {
        width: 128,
        quality: 90
      });
      
      // Each variant should have the size options
      expect(result.webp).toContain('w_128');
      expect(result.avif).toContain('w_128');
      expect(result.original).toContain('w_128');
      
      // But only webp/avif should have format transforms
      expect(result.webp).toContain('f_webp');
      expect(result.avif).toContain('f_avif');
    });
  });

  describe('Edge Cases and Boundaries', () => {
    it('handles undefined options', () => {
      const result = buildCloudinaryUrl('test', undefined);
      expect(result).toBeTruthy();
      expect(result).toContain('test');
    });

    it('handles paths with special characters', () => {
      const result = buildCloudinaryUrl('folder/sub-folder/my-image.jpg');
      expect(result).toContain('folder/sub-folder/my-image.jpg');
    });

    it('handles numeric quality values', () => {
      const result = buildCloudinaryUrl('test', { quality: 100 });
      expect(result).toContain('q_100');
    });

    it('handles string quality values', () => {
      const result = buildCloudinaryUrl('test', { quality: 'auto:best' });
      expect(result).toContain('q_auto:best');
    });
  });

  describe('Real-world Scenarios', () => {
    it('optimizes blog post images correctly', () => {
      const result = getCloudinaryImageUrl('/img/uploads/bash.png', {
        width: 800,
        format: 'webp',
        quality: 'auto'
      });
      
      expect(result).toContain('briandouglas-me/blog/bash');
      expect(result).toContain('w_800');
      expect(result).toContain('f_webp');
      expect(result).toContain('q_auto');
    });

    it('handles favicon with multiple sizes', () => {
      const sizes = [16, 32, 48, 64];
      const results = sizes.map(size => 
        getCloudinaryImageUrl('/images/favicon.png', {
          width: size,
          height: size
        })
      );
      
      results.forEach((result, index) => {
        expect(result).toContain(`w_${sizes[index]}`);
        expect(result).toContain(`h_${sizes[index]}`);
      });
    });

    it('generates responsive image set', () => {
      const formats = getModernImageFormatsFromPath('/gifs/pr-cached.gif', {
        width: 400
      });
      
      // Verify we get different URLs for different formats
      expect(formats.webp).not.toEqual(formats.avif);
      expect(formats.webp).not.toEqual(formats.original);
      expect(formats.avif).not.toEqual(formats.original);
    });
  });
});