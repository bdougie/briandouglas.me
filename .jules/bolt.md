## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2025-02-27 - Progressive Image Loading vs LCP
**Learning:** The `OptimizedImage` component with `progressive={true}` uses an opacity transition (fade-in) which negatively impacts Largest Contentful Paint (LCP) for above-the-fold images.
**Action:** Always set `progressive={false}` for images that are critical for LCP (above the fold), especially the main profile avatar or hero image.
