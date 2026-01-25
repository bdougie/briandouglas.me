## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2026-01-25 - LCP Impact of Progressive Image Loading
**Learning:** Using `progressive={true}` on `OptimizedImage` for above-the-fold images (like the profile avatar) introduces an opacity transition that negatively impacts Largest Contentful Paint (LCP).
**Action:** Always set `progressive={false}` for images that are likely to be LCP candidates (above-the-fold, especially `loading="eager"` images) to ensure immediate rendering.
