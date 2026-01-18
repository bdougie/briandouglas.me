## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.
