# Scripts Directory

This directory contains build and maintenance scripts for the briandouglas.me site.

## Active Scripts

### 🖼️ Image Pipeline

#### `upload-blog-images.mjs`
**Purpose**: Uploads images from `/public/images/` to Cloudinary CDN  
**Usage**: `npm run upload:images`  
**Features**:
- Smart caching with SHA-256 hash comparison
- Only uploads new or modified images
- Stores upload history in `.cloudinary-uploads.json`
- Graceful error handling

#### `replace-image-paths.mjs`
**Purpose**: Replaces local image paths with Cloudinary URLs in blog posts  
**Usage**: `npm run replace:paths`  
**Features**:
- Scans all `.mdx` and `.md` files
- Replaces multiple path patterns (`/images/`, `./`, etc.)
- Preserves external URLs
- Reports all replacements

#### `optimize-images.mjs`
**Purpose**: Optimizes images for web delivery  
**Usage**: 
- `npm run optimize:images` - Basic optimization
- `npm run optimize:images:all` - With WebP conversion
**Features**:
- Compresses images
- Generates WebP versions (with --webp flag)
- Preserves originals

### 🔧 Utility Scripts

#### `generate-favicon.js`
**Purpose**: Generates favicon files from source image  
**Usage**: `node scripts/generate-favicon.js`  
**Note**: Run manually when favicon needs updating

#### `generate-sitemap.js`
**Purpose**: Generates sitemap.xml for SEO  
**Usage**: Integrated into build process  
**Note**: Runs automatically during build

#### `migrate-blog-images.js`
**Purpose**: One-time migration tool for moving images to Cloudinary  
**Usage**: `node scripts/migrate-blog-images.js`  
**Note**: Legacy script for initial migration

## Deprecated Scripts

These scripts are no longer needed and can be removed:

- `upload-to-cloudinary.js` - Replaced by `upload-blog-images.mjs`
- `upload-to-cloudinary.mjs` - Duplicate functionality

## Build Pipeline

The scripts are integrated into the build process:

```json
{
  "scripts": {
    "build": "npm run prebuild && npm run optimize:images && astro build",
    "prebuild": "npm run upload:images && npm run replace:paths"
  }
}
```

**Build flow:**
1. Upload images to Cloudinary (`upload-blog-images.mjs`)
2. Replace paths in posts (`replace-image-paths.mjs`)
3. Optimize images (`optimize-images.mjs`)
4. Build site with Astro

## Environment Variables

Required for Cloudinary upload:
```bash
CLOUDINARY_CLOUD_NAME=bdougie
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Development

### Adding New Scripts

1. Use `.mjs` extension for ES modules
2. Add script to `package.json` if needed
3. Document in this README
4. Consider error handling and logging

### Testing Scripts

```bash
# Test image upload
npm run upload:images

# Test path replacement
npm run replace:paths

# Test full pipeline
npm run prebuild
```

## Maintenance

### Clearing Cache

If images need re-uploading:
```bash
rm .cloudinary-uploads.json
npm run upload:images
```

### Debugging

Set verbose logging:
```bash
DEBUG=* npm run upload:images
```

## Related Documentation

- `/docs/complete-image-pipeline.md` - Full image pipeline guide
- `/docs/netlify-cloudinary-setup.md` - Netlify configuration
- `/docs/image-pipeline.md` - Component details