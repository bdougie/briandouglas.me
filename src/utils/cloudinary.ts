/**
 * Cloudinary dynamic social card generation utility
 * Replaces static OG image generation with dynamic Cloudinary URLs
 */

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'bdougie';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

export interface SocialCardConfig {
  title: string;
  description?: string;
  author?: string;
  site?: string;
}

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

/**
 * Generate a Cloudinary URL for dynamic social card
 * Based on the current site design: black-to-gray gradient with golden accents
 */
export function generateCloudinaryOGImage(config: SocialCardConfig): string {
  const {
    title,
    description = '',
    author = 'Brian Douglas',
    site = 'briandouglas.me'
  } = config;

  // Get Cloudinary config from environment variables
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const templateImage = import.meta.env.PUBLIC_CLOUDINARY_TEMPLATE_ID || 'social-card-template';
  
  // Fallback if no Cloudinary config
  if (!cloudName) {
    console.warn('Missing PUBLIC_CLOUDINARY_CLOUD_NAME - falling back to static OG image');
    return '/images/og-default.png';
  }

  // URL encode text for Cloudinary
  const encodeText = (text: string): string => {
    return encodeURIComponent(text)
      .replace(/'/g, '%E2%80%99')  // Smart quotes
      .replace(/"/g, '%E2%80%9D'); // Smart quotes
  };

  // Truncate title if too long (approximate character limit for readability)
  const truncatedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const truncatedDesc = description.length > 120 ? description.substring(0, 117) + '...' : description;

  // Base Cloudinary URL
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Build transformation chain
  const transformations = [
    // Use the template image as base
    `c_fill,w_1200,h_630`,
    
    // Add dark gradient background (black to gray)
    `l_text:arial_72_bold:${encodeText(truncatedTitle)},co_rgb:D4AB6A,c_fit,w_1000,h_200`,
    `fl_layer_apply,g_north_west,x_100,y_150`,
    
    // Add description if provided
    ...(description ? [
      `l_text:arial_42:${encodeText(truncatedDesc)},co_rgb:E5E7EB,c_fit,w_1000,h_120`,
      `fl_layer_apply,g_north_west,x_100,y_350`
    ] : []),
    
    // Add author name
    `l_text:arial_32:${encodeText(author)},co_rgb:E5E7EB`,
    `fl_layer_apply,g_south_west,x_100,y_100`,
    
    // Add site name
    `l_text:arial_32:${encodeText(site)},co_rgb:C69749`,
    `fl_layer_apply,g_south_east,x_100,y_100`,
    
    // Add golden top stripe effect
    `l_text:arial_1:.,co_rgb:735F32,c_fill,w_1200,h_8`,
    `fl_layer_apply,g_north`
  ];

  // Construct final URL
  const transformationString = transformations.join('/');
  return `${baseUrl}/${transformationString}/${templateImage}`;
}

/**
 * Generate a simple Cloudinary URL using text overlay on a solid background
 * This version doesn't require a template image - creates everything programmatically
 */
export function generateSimpleCloudinaryOG(config: SocialCardConfig): string {
  const {
    title,
    description = '',
    author = 'Brian Douglas',
    site = 'briandouglas.me'
  } = config;

  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('Missing PUBLIC_CLOUDINARY_CLOUD_NAME - falling back to static OG image');
    return '/images/og-default.png';
  }

  const encodeText = (text: string): string => {
    return encodeURIComponent(text)
      .replace(/'/g, '%E2%80%99')
      .replace(/"/g, '%E2%80%9D');
  };

  // Truncate text for better fit
  const truncatedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Create a pure black background without any template image
  // Using Cloudinary's blank image generation
  const transformations = [
    // Create a 1200x630 black rectangle
    `w_1200,h_630,c_pad,b_rgb:000000`,
    
    // Add title in white, centered
    `l_text:arial_72_bold:${encodeText(truncatedTitle)},co_rgb:FFFFFF,c_fit,w_1000`,
    `fl_layer_apply,g_center`,
    
    // Add site URL at the bottom in a subtle gray
    `l_text:arial_36:${encodeText(site)},co_rgb:888888`,
    `fl_layer_apply,g_south,y_60`
  ];

  // Use Cloudinary's blank image feature
  const transformationString = transformations.join('/');
  return `${baseUrl}/${transformationString}/v1/blank`;
}