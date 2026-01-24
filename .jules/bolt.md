## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2025-08-23 - LCP Impact of Progressive Image Loading
**Learning:** The `progressive={true}` prop on `OptimizedImage` introduces an opacity transition (fade-in) that delays the Largest Contentful Paint (LCP) for above-the-fold images.
**Action:** Always use `progressive={false}` for LCP candidates or any above-the-fold imagery to ensure immediate rendering.
