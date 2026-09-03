# Blog diagram style

Use [blog-diagram-template.svg](blog-diagram-template.svg) as the starting point for diagrams in posts.

## Visual rules

- Match the article, not a dashboard: black canvas, open space, no outer card, no shadows, and no gradients.
- Use orange `#f97316` for routes and `#fb923c` for labels or measured values. Do not use it as decoration.
- Use white `#ffffff` for conclusions, gray `#d1d5db` for explanations, and muted gray `#9ca3af` for supporting detail.
- Use the site's system font stack. Reserve the monospace stack for step numbers, counts, commands, and checks.
- Align text to the left edge used by the post. Prefer thin rules and route lines over rounded boxes.
- Make the diagram read as a sentence: known input, branching work, verified result.
- Keep the desktop source 720 pixels wide. If it contains columns, make a 390-pixel mobile companion and serve both with a `picture` element.
- Keep desktop text at 16 pixels or larger and mobile text at 14 pixels or larger.
- Add an SVG `title` and `desc`, useful image alt text, and a caption that explains why the diagram matters.

## Reuse

1. Copy the SVG template into `public/images/blog/`.
2. Replace the bracketed labels and update the accessible `title` and `desc`.
3. Remove any branch or annotation the story does not need.
4. If the desktop layout has columns, create a stacked mobile version instead of shrinking the text.
5. Open the rendered post at desktop and narrow widths before shipping.

The Sweeper diagram is the first use of this system:

- `public/images/blog/sweeper-crew.svg`
- `public/images/blog/sweeper-crew-mobile.svg`
