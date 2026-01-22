## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2024-05-24 - Progressive Image Loading and LCP
**Learning:** The `OptimizedImage` component's `progressive={true}` prop uses an opacity transition (`opacity: 0` -> `opacity: 1` on load) which delays the LCP (Largest Contentful Paint) for above-the-fold images. The browser considers the image "painted" only when it becomes visible.
**Action:** Disable progressive loading (`progressive={false}`) for critical above-the-fold images (like the profile avatar in `index.astro`) to allow immediate painting.
