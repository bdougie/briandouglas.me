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
    format: 'directory',
    inlineStylesheets: 'auto'
  },
  routing: {
    prefixDefaultLocale: false
  },
  // Make sure assets are correctly referenced in nested routes
  base: '/',
  trailingSlash: 'ignore',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
        png: {
          quality: 85,
          compressionLevel: 9
        },
        jpeg: {
          quality: 85,
          progressive: true
        },
        webp: {
          quality: 85
        },
        avif: {
          quality: 80
        }
      }
    },
    domains: ['briandouglas.me', 'res.cloudinary.com'],
    remotePatterns: [
      { protocol: "https" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ]
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