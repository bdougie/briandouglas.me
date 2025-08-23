/**
 * Cloudinary dynamic social card generation utility
 * Replaces static OG image generation with dynamic Cloudinary URLs
 */

export interface SocialCardConfig {
  title: string;
  description?: string;
  author?: string;
  site?: string;
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
  
  // Create a pure black background with minimal design
  const transformations = [
    // Start with a pure black rectangle
    `c_fill,w_1200,h_630,b_rgb:000000`,
    
    // Add title in white, centered
    `l_text:arial_72_bold:${encodeText(truncatedTitle)},co_rgb:FFFFFF,c_fit,w_1000`,
    `fl_layer_apply,g_center`,
    
    // Add site URL at the bottom in a subtle gray
    `l_text:arial_36:${encodeText(site)},co_rgb:888888`,
    `fl_layer_apply,g_south,y_60`
  ];

  // Use a 1x1 transparent pixel as the base image
  const transformationString = transformations.join('/');
  return `${baseUrl}/${transformationString}/v1/sample.png`;
}