# Cloudinary Dynamic Social Cards Setup

This project now supports dynamic social card generation using Cloudinary's image transformation API, replacing the previous static HTML-based OG image generation.

## Benefits

- **Dynamic content**: Generate social cards without rebuilding the site
- **Performance**: No build-time overhead, cards generated on-demand
- **Consistency**: Maintains your site's design with automatic brand colors and styling
- **Fallback**: Automatically falls back to existing static generation if Cloudinary isn't configured

## Quick Setup

### 1. Get Cloudinary Account
1. Sign up for free at [cloudinary.com](https://cloudinary.com)
2. Find your **Cloud Name** in your Cloudinary dashboard

### 2. Configure Environment Variables
Add your Cloudinary cloud name to your environment:

```bash
# .env or .env.local
PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

That's it! The system will automatically:
- Generate dynamic social cards using your existing site design
- Use your brand colors (black-to-gray gradient with golden accents)
- Include post titles, descriptions, and author information
- Fall back to static images if Cloudinary isn't configured

## Testing

Visit `/social-card` to see the integration in action and verify your setup.

## Customization Options

### Optional Template Image
You can upload a custom background template to your Cloudinary account and reference it:

```bash
PUBLIC_CLOUDINARY_TEMPLATE_ID=your-custom-template-id
```

### Design Details
The generated cards automatically include:
- **Background**: Black to dark gray gradient matching your site theme
- **Colors**: Golden accent color (#D4AB6A) for titles, matching your site
- **Content**: Post title, description, author name, and site URL
- **Branding**: Golden top stripe and consistent typography

## How It Works

1. **Layout.astro** calls the Cloudinary utility for each page
2. **cloudinary.ts** generates dynamic URLs with text overlays
3. Meta tags use the Cloudinary URL instead of static paths
4. **Fallback**: If no Cloudinary config, uses existing static system

## Advanced Usage

The `generateSimpleCloudinaryOG()` function accepts:
```typescript
{
  title: string;           // Page/post title
  description?: string;    // Optional description
  author?: string;         // Defaults to "Brian Douglas"
  site?: string;          // Defaults to "briandouglas.me"
}
```

## Troubleshooting

- **Images not loading**: Check your `PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- **Fallback to static**: Normal behavior when Cloudinary isn't configured
- **Text encoding issues**: The system automatically handles special characters

The implementation is designed to be simple and robust - just add your cloud name and it works!