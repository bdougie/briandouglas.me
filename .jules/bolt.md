## 2024-05-23 - Sequential API Calls in Astro Component
**Learning:** `BlueskyInteractions.astro` was performing sequential API calls (`getPostThread` then `getLikes`) which unnecessarily prolonged the build time (or render time).
**Action:** Used `Promise.all` to fetch both resources in parallel. This is a common pattern to look for in other components fetching data from multiple sources.

## 2026-01-28 - Progressive Loading on LCP Images
**Learning:** The `progressive={true}` prop on `OptimizedImage` introduces an opacity transition (fade-in) via inline styles that negatively impacts LCP (Largest Contentful Paint) for above-the-fold images.
**Action:** Always disable progressive loading (`progressive={false}`) for hero images, avatars, or any critical image visible in the initial viewport to ensure they render immediately.

## 2026-01-30 - Lazy Load Bluesky Interactions
**Learning:** The `BlueskyInteractions.astro` component was fetching data immediately on page load, even for posts where the comments were at the bottom of the page. This delayed TTI and wasted bandwidth.
**Action:** Implemented `IntersectionObserver` to lazy load the interactions only when they come into view (with a 200px margin). This saves initial network requests and main thread time.

## 2026-01-31 - Unused Preconnects
**Learning:** The site used system fonts but had a preconnect to `fonts.googleapis.com`. Even if fonts were used, `crossorigin` on preconnect can prevent connection reuse for non-CORS CSS requests.
**Action:** Remove unused preconnects. Ensure `crossorigin` matches the request mode (CORS vs non-CORS) if adding preconnects in the future.
