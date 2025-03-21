import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  build: {
    format: 'file'
  },
  routing: {
    prefixDefaultLocale: false
  }
});