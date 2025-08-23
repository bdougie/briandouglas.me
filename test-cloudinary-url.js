// Test the Cloudinary URL generation
const cloudName = 'bdougie';
const title = 'Social Card Preview';
const site = 'briandouglas.me';

const encodeText = (text) => {
  return encodeURIComponent(text)
    .replace(/'/g, '%E2%80%99')
    .replace(/"/g, '%E2%80%9D');
};

const truncatedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

// Build the complete transformation string
const urlPath = [
  `w_1200,h_630,c_scale`, // Scale to social card dimensions
  `b_rgb:000000`, // Ensure black background
  `l_text:Arial_72_bold:${encodeText(truncatedTitle)},co_rgb:FFFFFF,w_1000,c_fit`, // Title
  `fl_layer_apply,g_center`, // Center the title
  `l_text:Arial_36:${encodeText(site)},co_rgb:888888`, // Site URL
  `fl_layer_apply,g_south,y_60` // Position site URL at bottom
].join('/');

// Use Cloudinary's fetch to load a 1x1 black pixel data URI and transform it
const blackPixelDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const encodedDataUri = encodeURIComponent(blackPixelDataUri);

const url = `https://res.cloudinary.com/${cloudName}/image/fetch/${urlPath}/${encodedDataUri}`;

console.log('Generated URL:');
console.log(url);
console.log('\nURL Length:', url.length);
console.log('\nDecoded data URI:');
console.log(blackPixelDataUri);