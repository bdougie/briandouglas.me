## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2026-01-28 - Progressive Loading on LCP Images
**Learning:** The `progressive={true}` prop on `OptimizedImage` introduces an opacity transition (fade-in) via inline styles that negatively impacts LCP (Largest Contentful Paint) for above-the-fold images.
**Action:** Always disable progressive loading (`progressive={false}`) for hero images, avatars, or any critical image visible in the initial viewport to ensure they render immediately.
