import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
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