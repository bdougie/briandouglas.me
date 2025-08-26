# Cache Busting Implementation

## Overview
This site implements automatic cache busting using Git commit SHAs to ensure visitors always receive the latest content, especially for blog posts and assets.

## How It Works

### Commit SHA-Based Versioning
The cache busting system uses the last 5 characters of the current Git commit SHA to create unique asset URLs. This ensures that every deployment creates uniquely named assets that browsers must fetch fresh.

### Implementation Details

#### Configuration (astro.config.mjs)
```javascript
import { execSync } from 'child_process';

// Get the last 5 characters of the current commit SHA
const commitSHA = execSync('git rev-parse --short=5 HEAD').toString().trim();
```

#### Asset Naming Strategy
The commit SHA is appended to all generated assets during the build process:

1. **Assets Directory**: `assets-{commitSHA}/`
   - Example: `assets-47dde/`

2. **JavaScript Files**: `[name]-{commitSHA}.js`
   - Example: `page-47dde.js`

3. **CSS Files**: `assets/css/[name]-{commitSHA}.css`
   - Example: `assets/css/styles-47dde.css`

4. **Image Assets**: `assets/images/[name]-{commitSHA}.[ext]`
   - Example: `assets/images/logo-47dde.png`

### Build Configuration
The Vite/Rollup configuration in `astro.config.mjs` handles the asset naming:

```javascript
vite: {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Organize assets by type with commit SHA
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          
          if (/css/i.test(extType)) {
            return `assets/css/[name]-${commitSHA}.[ext]`;
          }
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-${commitSHA}.[ext]`;
          }
          return `assets/[name]-${commitSHA}.[ext]`;
        },
        chunkFileNames: `assets/js/[name]-${commitSHA}.js`,
        entryFileNames: `assets/js/[name]-${commitSHA}.js`
      }
    }
  }
}
```

## Benefits

### 1. Automatic Cache Invalidation
- Every commit generates new asset URLs
- Browsers are forced to download fresh content
- No manual cache clearing required

### 2. Zero-Downtime Updates
- Old assets remain accessible during deployment
- Users on the old version continue to work
- New visitors automatically get the latest version

### 3. Reliable Content Delivery
- Eliminates stale cache issues
- Ensures latest blog posts are visible immediately
- Prevents mixed version problems

## Deployment Process

1. **Commit Changes**: Make changes and commit to Git
2. **Build Process**: `npm run build` automatically:
   - Retrieves current commit SHA
   - Generates assets with SHA suffix
   - Updates all internal references
3. **Deploy**: Upload to hosting (Netlify, etc.)
4. **Browser Behavior**: 
   - New asset URLs force fresh downloads
   - Old cached assets are ignored
   - Users see latest content immediately

## Testing Cache Busting

To verify cache busting is working:

1. **Check Asset Names**: 
   ```bash
   ls -la dist/assets-*
   ```
   Should show directory with commit SHA suffix

2. **Verify File Names**:
   ```bash
   ls dist/assets/js/*.js
   ```
   All JavaScript files should have SHA suffix

3. **Test After Commit**:
   - Make a new commit
   - Run build again
   - Verify different SHA in asset names

## Troubleshooting

### Assets Not Updating
- Ensure Git repository is initialized
- Verify commit exists: `git rev-parse --short=5 HEAD`
- Check build logs for the SHA being used

### Build Failures
- If not in a Git repository, the build will fail
- Solution: Initialize Git or modify config to use a fallback:
  ```javascript
  const commitSHA = (() => {
    try {
      return execSync('git rev-parse --short=5 HEAD').toString().trim();
    } catch {
      return 'dev'; // Fallback for non-Git environments
    }
  })();
  ```

### CDN Considerations
- Some CDNs may cache based on file paths
- Ensure CDN respects query parameters or path changes
- Consider CDN cache purging if needed

## Related Documentation
- [Image Pipeline](./image-pipeline.md) - Image optimization and delivery
- [Cloudinary Setup](./cloudinary-setup.md) - CDN integration for images