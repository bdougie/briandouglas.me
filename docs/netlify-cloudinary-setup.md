# Netlify Cloudinary Build Setup

This document explains how to configure automatic Cloudinary image uploads during the Netlify build process.

## Overview

Images in `public/images/` are automatically uploaded to Cloudinary during the build process, ensuring all blog images are served from the CDN without manual intervention.

## Setup Instructions

### 1. Get Cloudinary Credentials

1. Log into [Cloudinary Console](https://cloudinary.com/console)
2. Navigate to Settings → Access Keys
3. Copy your:
   - Cloud Name (already set as `bdougie`)
   - API Key
   - API Secret

### 2. Configure Netlify Environment Variables

1. Go to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Navigate to Site Settings → Environment Variables
4. Add the following variables:

```
CLOUDINARY_CLOUD_NAME=bdougie
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

### 3. How It Works

During the build process (`npm run build`):

1. **Prebuild Step** (`scripts/upload-blog-images.mjs`)
   - Scans all images in `public/images/`
   - Checks if images are already uploaded (using hash comparison)
   - Uploads new or changed images to Cloudinary
   - Caches upload information to avoid re-uploads

2. **Image Optimization** (`scripts/optimize-images.mjs`)
   - Optimizes local images for development

3. **Astro Build**
   - Builds the static site with Cloudinary URLs

## Features

### Automatic Upload
- Images in `public/images/` are automatically uploaded to Cloudinary
- Files are uploaded to the `blog/` folder in Cloudinary
- File names are preserved (without extensions)

### Smart Caching
- Uses SHA-256 hash to detect changed images
- Only uploads new or modified images
- Cache stored in `.cloudinary-uploads.json` (gitignored)

### Build Safety
- Missing credentials won't break the build
- Upload failures are logged but don't stop the build
- Graceful fallback to local images if needed

### URL Format
Uploaded images are available at:
```
https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/[image-name]
```

## Usage in Blog Posts

### Option 1: Cloudinary URL (Recommended)
```markdown
![Alt text](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/my-image)
```

### Option 2: Local Path (Auto-uploaded)
Place image in `public/images/` and reference:
```markdown
![Alt text](/images/my-image.png)
```
The build process will upload it automatically.

## Manual Upload Command

You can also manually trigger uploads:
```bash
npm run upload:images
```

## Testing Locally

To test the upload process locally:

```bash
# Set credentials
export CLOUDINARY_API_KEY=your-key
export CLOUDINARY_API_SECRET=your-secret

# Run upload
npm run upload:images
```

## Troubleshooting

### Images Not Uploading
1. Check environment variables are set in Netlify
2. Verify API credentials are correct
3. Check build logs for error messages

### Cache Issues
Delete `.cloudinary-uploads.json` to force re-upload:
```bash
rm .cloudinary-uploads.json
npm run upload:images
```

### Build Failures
The upload script is designed not to fail builds. Check logs for warnings:
- `⚠️ Cloudinary credentials not found` - Set env vars
- `❌ Failed to upload` - Check API limits or network

## Best Practices

1. **Keep Images Small**: Optimize before adding to repo
2. **Use Descriptive Names**: `feature-comparison-chart.png` not `img1.png`
3. **Organize by Date**: Consider folders like `2025/08/` for many images
4. **Clean Up**: Remove unused images from `public/images/`

## Migration from Manual Process

For existing images:
1. Add them to `public/images/`
2. Run `npm run upload:images`
3. Update blog posts to use Cloudinary URLs
4. Commit changes

## Security Notes

- Never commit API credentials
- Use Netlify environment variables only
- The `.cloudinary-uploads.json` cache file is gitignored
- API credentials are only used during build time

## Future Enhancements

Potential improvements:
- Automatic image optimization before upload
- Support for nested folders in `public/images/`
- Webhook for instant uploads on commit
- Integration with CMS for image management