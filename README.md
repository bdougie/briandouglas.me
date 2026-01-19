# briandouglas.me

This is my personal website and blog built with Astro, a modern static site generator that delivers lightning-fast performance by shipping minimal JavaScript.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/briandouglas/briandouglas.me)

## ✨ Architecture

The site follows a standard Astro structure:

- `src/pages` - All content pages and blog posts
- `src/layouts` - The main Layout component used across the site
- `src/components` - Reusable UI components

The theme uses a customized dark/light mode toggle with Tailwind for styling and includes responsive design throughout.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## 📝 Writing Blog Posts

To create a new blog post:

1. Create a new Markdown file in the `src/pages/posts/` directory following this naming convention:
   ```
   YYYY-MM-DD-post-title-slug.md
   ```

2. Add the required frontmatter at the top of your file:
   ```md
   ---
   title: Your Post Title
   date: YYYY-MM-DD
   description: A brief description of your post
   ---

   # Your Post Title

   Post content goes here...
   ```

3. Write your content using standard Markdown syntax.

4. Posts are automatically routed to `/YYYY/MM/DD/post-title-slug` and will appear on the homepage and blog index page when built.

## 🖼️ Blog Post Images

Blog images are hosted on Cloudinary for automatic optimization and CDN delivery.

### Adding Images to Posts

Use Cloudinary URLs directly in your markdown/MDX:

```md
<img src="https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/your-image-name" alt="Description" width="600" />
```

The `f_auto,q_auto` parameters automatically serve the best format (WebP, AVIF) and quality for each browser.

### Uploading New Images

1. Add images to `public/images/`
2. Run the upload script during build (or manually):
   ```bash
   npm run upload:images
   ```
3. Images are uploaded to Cloudinary's `blog/` folder
4. Use the Cloudinary URL in your post

## 🃏 Social Cards (OG Images)

Social cards are pre-generated static images stored on Cloudinary. This ensures fast, reliable previews when sharing posts on LinkedIn, Bluesky, Twitter, etc.

### How It Works

- Each blog post has a static OG image at: `https://res.cloudinary.com/bdougie/image/upload/og/{slug}.png`
- Images are 1200x630px with the post title on a black background
- Non-blog pages use a default OG image

### Generating OG Images

**For a new post:**
```bash
npm run og:generate -- your-post-slug
```

**Options:**
```bash
npm run og:generate -- your-post-slug --local  # Save locally only, don't upload
npm run og:generate -- your-post-slug --dry-run  # Preview without saving
```

**For bulk migration (all posts):**
```bash
npm run og:migrate
```

### Environment Variables

OG image generation requires Cloudinary credentials in `.env`:
```
CLOUDINARY_CLOUD_NAME=bdougie
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🦋 Bluesky Comments

Blog posts can display likes, reposts, and replies from a linked Bluesky post.

### Adding Bluesky Comments to a Post

1. Publish your blog post
2. Create a Bluesky post linking to your article
3. Add the `blueskyUrl` to your post's frontmatter:

```md
---
title: Your Post Title
date: 2026-01-18
description: Post description
blueskyUrl: "https://bsky.app/profile/your-handle/post/abc123"
---
```

### Features

- Displays like count with stacked avatars of people who liked
- Shows reply count and recent replies
- Repost count
- Links back to the Bluesky post for engagement
- Compact mode on homepage, full mode on post pages

### Using DID for Stable URLs

For more stable URLs (handles can change), use the DID format:
```md
blueskyUrl: "https://bsky.app/profile/did:plc:abc123/post/xyz789"
```

You can find your DID by inspecting any of your Bluesky post URLs in the API.

## 🎨 Styling & Customization

The site uses Tailwind CSS with a custom color scheme:
- Primary: Dark theme background
- Secondary: Dark accents
- Accent/Highlight: Gold accents for buttons and links

The typography is enhanced with the `@tailwindcss/typography` plugin for rich text styling in blog posts.

## 🤖 CodeBunny AI Code Reviews

This repository uses [CodeBunny](https://github.com/bdougie/codebunny) for automated AI-powered code reviews on pull requests.

### Configuration

The workflow requires the following repository secrets and variables:

**Secrets:**
- `CONTINUE_API_KEY` - Your Continue API key
- `APP_PRIVATE_KEY` - (Optional) GitHub App private key for enhanced authentication

**Variables:**
- `CONTINUE_ORG` - Your Continue Hub organization name
- `CONTINUE_CONFIG` - Your Continue assistant slug (format: `owner/package-name`)
- `APP_ID` - (Optional) GitHub App ID for enhanced authentication

### Usage

CodeBunny automatically reviews PRs when they are opened, synchronized, or marked ready for review. You can also trigger a review by commenting `@codebunny` on any PR.

## 🏗️ Deployment

This site is deployed on Netlify, which automatically builds and deploys the site when changes are pushed to the main branch.

## 🧞 Commands

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run og:generate`  | Generate OG image for a single post              |
| `npm run og:migrate`   | Generate OG images for all posts (one-time)      |
| `npm run upload:images`| Upload local images to Cloudinary                |
