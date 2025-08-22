// Cloudinary configuration and utilities
// Replace 'your-cloud-name' with actual Cloudinary cloud name in production
const CLOUDINARY_CLOUD_NAME = 'briandouglas'; // This would be set via env vars in production
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

/**
 * Generate Cloudinary URL with optimizations
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Object} options - Transformation options
 * @returns {string} Optimized Cloudinary URL
 */
export function buildCloudinaryUrl(publicId, options = {}) {
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
 * Upload local image to Cloudinary and return URL
 * This is a placeholder for the upload functionality
 * In production, you'd use Cloudinary's upload API
 */
export function getCloudinaryImageUrl(localPath, options = {}) {
  // Map local paths to Cloudinary public IDs
  const pathMap = {
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
 * Get responsive image srcset for different screen sizes
 */
export function getResponsiveImageSrcSet(publicId, options = {}) {
  const sizes = [480, 768, 1024, 1280, 1536];
  const { height, ...restOptions } = options;
  
  return sizes
    .map(width => {
      const aspectRatio = height && options.width ? height / options.width : 1;
      const responsiveHeight = Math.round(width * aspectRatio);
      
      return `${buildCloudinaryUrl(publicId, {
        ...restOptions,
        width,
        height: height ? responsiveHeight : undefined
      })} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate WebP and AVIF variants for modern browsers
 */
export function getModernImageFormats(publicId, options = {}) {
  return {
    webp: buildCloudinaryUrl(publicId, { ...options, format: 'webp' }),
    avif: buildCloudinaryUrl(publicId, { ...options, format: 'avif' }),
    original: buildCloudinaryUrl(publicId, options)
  };
}

/**
 * Get modern formats from a local path
 */
export function getModernImageFormatsFromPath(localPath, options = {}) {
  const pathMap = {
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
  return publicId ? getModernImageFormats(publicId, options) : null;
}