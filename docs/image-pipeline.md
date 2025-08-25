# Blog Image Pipeline with Cloudinary

This document describes the image handling pipeline for blog posts using Cloudinary for optimized image delivery.

## Overview

All blog images are served through Cloudinary for:
- Automatic format optimization (WebP, AVIF when supported)
- Responsive image delivery
- Lazy loading support
- CDN distribution
- Automatic quality optimization

## Components

### 1. BlogImage Component (`src/components/BlogImage.astro`)
- Astro component for rendering optimized images
- Automatically converts local paths to Cloudinary URLs
- Supports captions and custom dimensions

### 2. Upload Script (`scripts/upload-to-cloudinary.mjs`)
- CLI tool for uploading images to Cloudinary
- Requires API credentials (set as environment variables)

### 3. Remark Plugin (`src/utils/remark-cloudinary-images.mjs`)
- Automatically transforms image URLs in MDX files
- Converts local paths to Cloudinary URLs during build

## Usage

### In Blog Posts (MDX)

#### Simple Image
```markdown
![Alt text](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/image-name)
```

#### Using BlogImage Component
```astro
---
import BlogImage from '@components/BlogImage.astro';
---

<BlogImage 
  src="/images/performance-metrics.png"
  alt="Performance metrics"
  caption="LCP improved from 5.9s to 4.1s"
/>
```

### Uploading Images

#### Manual Upload via Cloudinary Dashboard
1. Log into [Cloudinary Console](https://cloudinary.com/console)
2. Navigate to Media Library
3. Create/select `blog` folder
4. Upload image
5. Copy the public URL

#### Using Upload Script
```bash
# Set credentials (one-time setup)
export CLOUDINARY_API_KEY=your-api-key
export CLOUDINARY_API_SECRET=your-api-secret

# Upload image
node scripts/upload-to-cloudinary.mjs public/images/my-image.png my-image-name
```

#### URL Format
All blog images follow this pattern:
```
https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/[image-name]
```

Where:
- `f_auto` - Automatic format selection
- `q_auto` - Automatic quality optimization
- `blog/` - Folder for blog images
- `[image-name]` - Image identifier (without extension)

## Best Practices

### 1. Image Naming
- Use descriptive names: `performance-metrics-bundle-optimization`
- Use hyphens, not underscores
- Keep names URL-friendly

### 2. Image Sizes
- Upload high-quality originals (Cloudinary will optimize)
- Default blog width: 800px
- Support 2x for retina: upload at least 1600px wide

### 3. Performance
- Always use `f_auto,q_auto` transformations
- Use lazy loading for below-fold images
- Consider responsive images for hero images

### 4. Organization
- Use `blog/` folder for all blog images
- Create subfolders for series: `blog/2025/performance/`
- Keep related images together

## Configuration

### Environment Variables
```bash
# Required for upload script
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Set in Astro (already configured)
PUBLIC_CLOUDINARY_CLOUD_NAME=bdougie
```

### Astro Config
The Cloudinary domain is already configured in `astro.config.mjs`:
```javascript
image: {
  domains: ['res.cloudinary.com']
}
```

## Migration Guide

### For Existing Local Images
1. Upload to Cloudinary: `blog/` folder
2. Update MDX files with Cloudinary URLs
3. Remove local images from `public/images/`

### For New Blog Posts
1. Upload images to Cloudinary first
2. Use Cloudinary URLs in MDX
3. Never commit large images to Git

## Troubleshooting

### Image Not Loading
- Check URL format is correct
- Verify image exists in Cloudinary dashboard
- Check browser console for errors

### Image Quality Issues
- Upload higher resolution originals
- Remove quality parameter for maximum quality
- Check Cloudinary dashboard settings

### Upload Script Errors
- Verify API credentials are set
- Check network connection
- Ensure image file exists

## Future Enhancements

1. **Automatic Upload on Build**
   - GitHub Action to upload new images
   - Pre-commit hook for image optimization

2. **Image Component Enhancements**
   - Responsive srcset generation
   - Blur placeholder support
   - Gallery component

3. **Content Pipeline**
   - Automatic image discovery in MDX
   - Bulk migration tool
   - Image usage analytics

## Resources

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Astro Cloudinary Docs](https://docs.astro.build/en/guides/media/cloudinary/)
- [astro-cloudinary Package](https://astro.cloudinary.dev/)
- [Cloudinary Transformations](https://cloudinary.com/documentation/transformation_reference)