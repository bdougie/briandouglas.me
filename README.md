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

CodeBunny automatically reviews PRs when they are opened, synchronized, or marked ready for review. You can also trigger a review by commenting `@continue-agent` on any PR.

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
