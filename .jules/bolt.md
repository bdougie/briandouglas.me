## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2024-05-24 - LCP Delay with Progressive Images
**Learning:** `OptimizedImage` with `progressive={true}` uses an initial `opacity: 0` and transition, which delays LCP for above-the-fold images.
**Action:** Always use `progressive={false}` for LCP candidates (images above the fold) to allow immediate painting.
