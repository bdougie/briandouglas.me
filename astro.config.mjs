import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { execSync } from 'child_process';

// Get the last 5 characters of the current commit SHA for cache busting
const commitSHA = execSync('git rev-parse --short=5 HEAD').toString().trim();

export default defineConfig({
  // Add your site URL here to ensure absolute URLs for social media
  site: 'https://briandouglas.me',
  integrations: [
    mdx(),
    tailwind({
      config: { path: './tailwind.config.mjs' },
      applyBaseStyles: true
    }),
    sitemap()
  ],
  build: {
    format: 'directory',
    inlineStylesheets: 'auto'
    // File-level cache busting via commitSHA in filenames is sufficient
    // Don't rename the assets folder as it conflicts with Vite's hardcoded paths
  },
  routing: {
    prefixDefaultLocale: false
  },
  // Make sure assets are correctly referenced in nested routes
  base: '/',
  trailingSlash: 'ignore',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'tap'
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
          manualChunks: undefined,
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            if (/css/i.test(extType)) {
              return `assets/css/[name]-${commitSHA}.[ext]`;
            }
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-${commitSHA}.[ext]`;
            }
            return `assets/[name]-${commitSHA}.[ext]`;
          },
          chunkFileNames: `assets/js/[name]-${commitSHA}.js`,
          entryFileNames: `assets/js/[name]-${commitSHA}.js`
        }
      }
    },
    ssr: {
      noExternal: ['@astrojs/tailwind']
    }
  }
});