---
title: "Adding Bluesky Comments to My Blog: A Technical Implementation"
description: "Learn how I integrated Bluesky's social features into my blog, creating a zero-maintenance comment system using the AT Protocol's open APIs. This technical walkthrough covers the implementation details, UI design decisions, and lessons learned from building social engagement without databases or authentication."
date: 2025-08-21
blueskyUrl: "https://bsky.app/profile/bizza.pizza/post/3lwvxpj6gms2m"
---

## The inspiration and motivation

After seeing [ashley.dev blog's Bluesky integration](https://ashley.dev/posts/the-quiet-season/), I realized I could bring the same social engagement to my own site. The beauty of this approach is that it leverages Bluesky's existing infrastructure - no need for databases, authentication systems, or moderation tools. Each blog post becomes a thread on Bluesky, and the conversations happening there automatically appear on my blog.

I typically document changes through pull requests, but I shipped this feature directly. This post serves as that missing PR description - a technical walkthrough of how Bluesky comments now power the discussion section on [briandouglas.me](https://briandouglas.me).

## The commits

- [Initial implementation: Add Bluesky interactions to blog posts](https://github.com/bdougie/briandouglas.me/commit/ea9adcbf8cb161bcf96ea4f65206632c72bc4dc3)
- [Enhancement: Better linking and CTAs](https://github.com/bdougie/briandouglas.me/commit/cd8bd01017e63faf1b80ac134ff40a654756f6d9)
- [UX improvement: Support simple Bluesky URLs](https://github.com/bdougie/briandouglas.me/commit/f14d80164f472756f2e5d99bc38098538aa12990)

## Implementation overview

The core implementation consists of an Astro component that:
1. Fetches post data from Bluesky's public API
2. Retrieves likes and replies for the post
3. Displays engagement metrics with stacked avatar visualizations
4. Shows a preview of recent replies
5. Gracefully handles errors with fallback states

## Breaking down the key components

### URI parsing evolution

Initially, I used AT Protocol URIs out of curiosity:
```
at://did:plc:xyz/app.bsky.feed.post/postid
```

But this was cumbersome for me as the primary user. [In a follow-up commit](https://github.com/bdougie/briandouglas.me/commit/f14d80164f472756f2e5d99bc38098538aa12990), I improved the UX by accepting regular Bluesky URLs in the frontmatter:

```yaml
# Much easier to use!
blueskyUrl: https://bsky.app/profile/handle/post/id
```

The component now automatically fetches the user's DID when a URL format is used, converting it to the AT Protocol URI behind the scenes. This maintains backwards compatibility while making it much easier to add Bluesky interactions to posts - I can just copy and paste the URL from my browser.

### Dual API calls for complete data

The implementation makes two separate API calls to gather all necessary information:

1. **Thread data**: Gets the post details and replies
```javascript
const apiUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(postUri)}&depth=1`;
```

2. **Likes data**: Fetches users who liked the post
```javascript
const likesUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getLikes?uri=${encodeURIComponent(postUri)}&limit=10`;
```

### Graceful error handling

The component implements multiple layers of error handling:
- Invalid URI format detection
- Network request failures
- Separate try-catch for likes (allowing the component to work even if likes fail)
- Fallback states for missing data

## The UI implementation

### Stacked avatar display

One of the most visually interesting parts is the stacked avatar display for likes. The avatars stack with negative margin (`-space-x-2`) and expand on hover (`hover:space-x-1`). Each avatar has a decreasing z-index to create the proper layering effect:

![stacked avatars](/stacked-avatars.gif)

```astro
<div class="avatar-stack flex -space-x-2 hover:space-x-1 transition-all duration-300">
  {likers.map((like: any, index: number) => (
    <a
      href={`https://bsky.app/profile/${like.actor?.handle}`}
      class="avatar-item relative transition-all duration-300 block"
      style={`z-index: ${5 - index}`}
    >
      <img
        src={like.actor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${like.actor?.handle}`}
        class="w-8 h-8 rounded-full border-2 border-black bg-gray-900 hover:border-orange-500"
      />
    </a>
  ))}
  {remainingLikes > 0 && (
    <div class="w-8 h-8 rounded-full border-2 border-black bg-gray-900 flex items-center justify-center">
      <span class="text-xs text-gray-400">+{remainingLikes}</span>
    </div>
  )}
</div>
```

### Reply preview

The component shows up to 5 recent replies with a clean, card-based design. Each reply includes the author's avatar, name, handle, and the comment text - all linking back to Bluesky for full engagement.

## Integration with blog posts

After the UX improvements, adding Bluesky comments to any blog post is now super simple. Just add the Bluesky URL to the frontmatter:

```yaml
---
title: "Your Blog Post Title"
date: 2025-08-19
blueskyUrl: "https://bsky.app/profile/bdougie/post/abc123"
---
```

Then include the component in the blog post layout:

```astro
import BlueskyInteractions from '../components/BlueskyInteractions.astro';

{frontmatter.blueskyUrl && (
  <BlueskyInteractions postUrl={frontmatter.blueskyUrl} />
)}
```

The component handles the conversion to AT Protocol URIs internally, so I get the best of both worlds - easy setup and proper API integration.

## Technical decisions

### Server-side rendering at build time

By using Astro's static generation, the API calls happen at build time rather than client-side. This means:
- Zero JavaScript required for basic display
- Better SEO as content is in the HTML
- Faster initial page loads
- Data freshness limited to build frequency

### Fallback for missing avatars

The implementation uses DiceBear avatars as fallbacks to ensure every user has a unique, deterministic avatar even if they haven't set one on Bluesky.

## What I learned

1. **AT Protocol's openness is powerful** - No API keys, no authentication, just public endpoints
2. **Progressive enhancement works** - The blog remains fully functional even if Bluesky is down
3. **Social proof drives engagement** - Showing faces of people who liked creates FOMO
4. **Simplicity wins** - No need for complex comment systems when you can leverage existing platforms

## Conclusion

By treating Bluesky as infrastructure rather than just a social network, I've created a comment system that requires zero maintenance, costs nothing to run, and provides better engagement than traditional comment forms. The open nature of the AT Protocol means this isn't vendor lock-in - it's building on open standards.

The implementation is live on [briandouglas.me](https://briandouglas.me) and the full source is available on [GitHub](https://github.com/bdougie/briandouglas.me). Feel free to adapt it for your own blog - and when you do, let me know on Bluesky!
