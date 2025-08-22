# Cloudinary CDN Migration

This document outlines the implementation of Cloudinary CDN integration for image optimization and caching.

## Overview

The migration implements:
1. **Cloudinary CDN Integration**: Optimized image delivery with automatic format selection
2. **Service Worker Caching**: Intelligent image caching for improved performance
3. **Progressive Enhancement**: Fallbacks to local images when needed

## Files Modified

### Core Implementation
- `src/utils/cloudinary.js` - Cloudinary configuration and URL generation utilities
- `src/components/OptimizedImage.astro` - Enhanced image component with Cloudinary support
- `public/sw.js` - Service worker for image caching
- `src/layouts/Layout.astro` - Service worker registration and updated favicon URLs
- `astro.config.mjs` - Added Cloudinary domain to allowed image sources

### Blog Posts Updated
- `src/pages/posts/2025-08-22-supabase-avatar-caching-performance.md` - Updated GIF reference
- `src/pages/posts/2025-08-21-bluesky-comments-implementation.md` - Updated GIF reference
- `src/pages/posts/2025-08-20-progressive-image-loading-avatars.md` - Updated GIF reference
- `src/pages/index.astro` - Updated avatar to use OptimizedImage component

### Utilities
- `scripts/migrate-blog-images.js` - Script to help migrate existing blog images

## Features

### Cloudinary Integration
- Automatic format optimization (WebP, AVIF)
- Quality optimization
- Responsive image generation
- Lazy loading support

### Service Worker Caching
- Cache-first strategy for images
- Background updates
- Intelligent cache management
- Support for both local and Cloudinary images

### Progressive Enhancement
- Fallback to local images when Cloudinary fails
- Maintains existing functionality
- Gradual migration support

## Image Mapping

The system maps local image paths to Cloudinary public IDs:
- `/images/*` → `briandouglas-me/*`
- `/gifs/*` → `briandouglas-me/gifs/*`
- `/img/uploads/*` → `briandouglas-me/blog/*`

## Usage

### Using OptimizedImage Component

```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';
---

<OptimizedImage 
  src="/gifs/example.gif" 
  alt="Example image" 
  width={800}
  height={600}
  useCloudinary={true}
/>
```

### Fallback Behavior

The component gracefully falls back to:
1. Local images when Cloudinary is disabled
2. Original Astro Image component for unmapped paths
3. Standard img tag for GIFs

## Performance Benefits

1. **Reduced Load Times**: CDN delivery with global edge locations
2. **Format Optimization**: Automatic WebP/AVIF serving to supported browsers
3. **Caching**: Service worker provides offline-first experience
4. **Bandwidth Savings**: Quality and compression optimization

## Next Steps

1. Upload all existing images to Cloudinary
2. Update remaining blog posts to use OptimizedImage
3. Monitor performance improvements
4. Consider adding responsive image breakpoints