## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2025-05-23 - LCP and Progressive Loading Anti-pattern
**Learning:** Using progressive loading (blur-up + fade-in) for the Largest Contentful Paint (LCP) element delays its visibility, hurting Core Web Vitals.
**Action:** Always ensure LCP images use `loading="eager"` and avoid opacity transitions or delayed rendering strategies.
