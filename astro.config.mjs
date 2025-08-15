import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Add your site URL here to ensure absolute URLs for social media
  site: 'https://briandouglas.me',
  integrations: [
    tailwind({
      config: { path: './tailwind.config.mjs' },
      applyBaseStyles: true
    }),
    sitemap()
  ],
  build: {
    format: 'file',
    inlineStylesheets: 'auto'
  },
  routing: {
    prefixDefaultLocale: false
  },
  // Make sure assets are correctly referenced in nested routes
  base: '/',
  trailingSlash: 'always',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  compressHTML: true,
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    ssr: {
      noExternal: ['@astrojs/tailwind']
    }
  }
});