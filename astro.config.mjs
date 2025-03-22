import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // Add your site URL here to ensure absolute URLs for social media
  site: 'https://briandouglas.me',
  integrations: [tailwind({
    config: { path: './tailwind.config.mjs' },
    applyBaseStyles: true
  })],
  build: {
    format: 'file'
  },
  routing: {
    prefixDefaultLocale: false
  },
  // Make sure assets are correctly referenced in nested routes
  base: '/',
  trailingSlash: 'always'
});