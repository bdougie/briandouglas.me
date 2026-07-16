/**
 * Cloudinary image URL utilities for blog content images.
 * (OG/social cards are generated at build time by src/pages/og/[...slug].png.ts)
 */

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'bdougie';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

/**
 * Build Cloudinary URL with optimizations
 */
export function buildCloudinaryUrl(publicId: string, options: any = {}): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    fetchFormat = 'auto'
  } = options;
  
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (fetchFormat) transformations.push(`f_${fetchFormat}`);
  
  const transformationString = transformations.join(',');
  
  return `${CLOUDINARY_BASE_URL}/image/upload/${transformationString}/${publicId}`;
}

/**
 * Get Cloudinary image URL for local paths
 */
export function getCloudinaryImageUrl(localPath: string, options: any = {}): string {
  // Map local paths to Cloudinary public IDs
  const pathMap: { [key: string]: string } = {
    '/images/black-social-bg.png': 'black-social-bg',
    '/images/favicon.svg': 'briandouglas-me/favicon',
    '/images/favicon.png': 'briandouglas-me/favicon-png',
    '/images/og-default.png': 'briandouglas-me/og-default',
    '/images/apple-touch-icon.png': 'briandouglas-me/apple-touch-icon',
    '/images/icon-192x192.png': 'briandouglas-me/icon-192',
    '/images/icon-512x512.png': 'briandouglas-me/icon-512',
    '/gifs/stacked-avatars.gif': 'briandouglas-me/gifs/stacked-avatars',
    '/gifs/pr-cached.gif': 'briandouglas-me/gifs/pr-cached',
    '/gifs/progressive-loading-demo.gif': 'briandouglas-me/gifs/progressive-loading-demo',
    // Blog post images
    '/img/uploads/2019-08-06-security-issues.png': 'briandouglas-me/blog/2019-08-06-security-issues',
    '/img/uploads/2019-08-06-blog-changelog.png': 'briandouglas-me/blog/2019-08-06-blog-changelog',
    '/img/uploads/jamstack-graphql.png': 'briandouglas-me/blog/jamstack-graphql',
    '/img/uploads/launchpad-graphql-jam.png': 'briandouglas-me/blog/launchpad-graphql-jam',
    '/img/uploads/bash.png': 'briandouglas-me/blog/bash',
    '/img/uploads/upgrade-graphcool-console.png': 'briandouglas-me/blog/upgrade-graphcool-console',
    '/img/uploads/download-graphcool.png': 'briandouglas-me/blog/download-graphcool'
  };
  
  const publicId = pathMap[localPath];
  if (!publicId) {
    console.warn(`No Cloudinary mapping found for: ${localPath}`);
    return localPath; // Fallback to original path
  }
  
  return buildCloudinaryUrl(publicId, options);
}

/**
 * Generate modern image formats from path
 */
export function getModernImageFormatsFromPath(localPath: string, options: any = {}) {
  const pathMap: { [key: string]: string } = {
    '/images/favicon.svg': 'briandouglas-me/favicon',
    '/images/favicon.png': 'briandouglas-me/favicon-png',
    '/images/og-default.png': 'briandouglas-me/og-default',
    '/images/apple-touch-icon.png': 'briandouglas-me/apple-touch-icon',
    '/images/icon-192x192.png': 'briandouglas-me/icon-192',
    '/images/icon-512x512.png': 'briandouglas-me/icon-512',
    '/gifs/stacked-avatars.gif': 'briandouglas-me/gifs/stacked-avatars',
    '/gifs/pr-cached.gif': 'briandouglas-me/gifs/pr-cached',
    '/gifs/progressive-loading-demo.gif': 'briandouglas-me/gifs/progressive-loading-demo',
    // Blog post images
    '/img/uploads/2019-08-06-security-issues.png': 'briandouglas-me/blog/2019-08-06-security-issues',
    '/img/uploads/2019-08-06-blog-changelog.png': 'briandouglas-me/blog/2019-08-06-blog-changelog',
    '/img/uploads/jamstack-graphql.png': 'briandouglas-me/blog/jamstack-graphql',
    '/img/uploads/launchpad-graphql-jam.png': 'briandouglas-me/blog/launchpad-graphql-jam',
    '/img/uploads/bash.png': 'briandouglas-me/blog/bash',
    '/img/uploads/upgrade-graphcool-console.png': 'briandouglas-me/blog/upgrade-graphcool-console',
    '/img/uploads/download-graphcool.png': 'briandouglas-me/blog/download-graphcool'
  };
  
  const publicId = pathMap[localPath];
  if (!publicId) {
    return {
      webp: localPath,
      avif: localPath,
      original: localPath
    };
  }
  
  return {
    webp: buildCloudinaryUrl(publicId, { ...options, format: 'webp' }),
    avif: buildCloudinaryUrl(publicId, { ...options, format: 'avif' }),
    original: buildCloudinaryUrl(publicId, options)
  };
}
