---
title: "From Full Rewrites to Edge Functions: A Performance Journey"
date: 2025-11-15
description: "How moving to edge functions improved performance without a full rewrite."
---

![Tweet about Next.js vs Astro for SSR](/images/edge-ssr-x.png)

Two days ago, I posted about [contributor.info's performance challenges](https://x.com/bdougieYO/status/2001071257056632944), particularly the 5.6 second Largest Contentful Paint (LCP) that was killing my SEO-critical pages. The responses pointed me toward modern frameworks—React Router v7 was hot, TanStack Start looked promising, and inevitably someone suggested "just rewrite it in Next.js."

I tried them. I really did. But here's the thing: contributor.info is a functioning product with real users, and I wasn't ready to bet weeks of development time on a complete architectural overhaul when I only needed to optimize three routes.

## The Exploration Phase

Following the X thread, I spent a day with React Router v7 (documented in [PR #1374](https://github.com/bdougie/contributor.info/pull/1374)). The new framework features looked great, but migrating my entire routing setup felt like using a sledgehammer for a thumbtack. TanStack Start had similar appeal—and similar migration complexity.

The pattern became clear: every "modern" solution wanted me to rethink my entire application architecture. But contributor.info didn't need rethinking. It needed faster paint times on the home page, trending page, and repository pages.

## Finding the Right Tool for the Job

This is where working at Netlify for years paid off. Edge Functions kept nagging at the back of my mind. What if instead of rewriting the entire app, I just pre-rendered the critical paths at the edge?

The approach was pragmatic:
- Keep the existing React SPA architecture
- Add selective SSR only where it matters for SEO and perceived performance
- Use edge functions to minimize latency
- Maintain the SPA experience after hydration

### The Implementation

The full implementation is in [PR #1379](https://github.com/bdougie/contributor.info/pull/1379). I created three targeted edge functions for my critical routes:

**`ssr-home.ts`** handles the landing page—hero card, repo stats, search input. All the above-the-fold content users and crawlers need.

**`ssr-trending.ts`** renders the trending repositories list, which is my second-highest traffic page.

**`ssr-repo.ts`** generates individual repository pages with detailed stats and contributor information.

Each function follows the same pattern:

```typescript
import { fetchHomeData } from './_shared/supabase';
import { renderHTML } from './_shared/html-template';

const homeData = await fetchHomeData();
const html = renderHTML(homeData);
return new Response(html, {
  headers: { 'content-type': 'text/html' }
});
```

The client-side picks up seamlessly with hydration utilities:

```typescript
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { ssrData } from './lib/ssr-hydration';

const rootElement = document.getElementById('root')!;
hydrateRoot(rootElement, <App initialData={ssrData} />);
```

### Smart Caching

The edge functions use aggressive but smart caching:
- Trending page: 2-minute cache, 10-minute stale-while-revalidate
- Repository pages: 5-minute cache, 1-hour stale-while-revalidate

And crucially, if SSR fails for any reason, I fall back to the existing SPA:

```typescript
try {
  const html = await renderSSR();
  return new Response(html, {
    headers: { 'content-type': 'text/html' }
  });
} catch {
  return new Response(await renderSPA(), {
    headers: { 'content-type': 'text/html' }
  });
}
```

## The Results

LCP dropped from 5.6 seconds to under 2.5 seconds. That's the headline number, but the real win is what I *didn't* do:

- Didn't rewrite the entire routing system
- Didn't migrate to a new framework
- Didn't introduce weeks of regression risk
- Didn't change the developer experience for the 80% of pages that didn't need SSR

## Key Lessons

**1. Modern doesn't always mean better.** React Router v7 and TanStack Start are excellent tools, but they're solving for greenfield projects or teams ready for major migrations. Sometimes you just need targeted optimization.

**2. Edge functions are underrated for selective SSR.** Everyone talks about Vercel, Cloudflare Workers, or full framework SSR. But edge functions for just your critical paths? That's a sweet spot a lot of developers miss.

**3. Measure what matters.** I didn't need every page to be fast. I needed the pages Google crawls and users land on to be fast. That focused scope made the solution feasible.

**4. Progressive enhancement still works.** The SPA fallback means I never break the user experience, even if edge rendering fails. That's not just good architecture—it's respecting your users.

## What's Next

This approach scales well for my use case. As contributor.info grows, I might add SSR to more routes, but I'll do it selectively, measuring impact at each step.

If you're facing similar performance challenges, don't let the framework hype train convince you that you need a full rewrite. Sometimes the best solution is the one that solves your specific problem without creating ten new ones.

The code is open source in the [contributor.info repo](https://github.com/bdougie/contributor.info)—check out the `netlify/edge-functions` directory if you want to see the implementation details.

---

Want to chat about edge SSR, performance optimization, or whether you *actually* need that framework migration? Hit me up on [X](https://x.com/bdougieYO) or check out the [Open Source Ready podcast](your-podcast-link) where we dive deep into topics like this.
