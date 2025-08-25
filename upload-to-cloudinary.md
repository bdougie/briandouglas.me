# Upload Performance Metrics Image to Cloudinary

## Steps to upload:

1. Go to your Cloudinary dashboard: https://cloudinary.com/console
2. Upload the image: `/public/images/performance-metrics.png`
3. Name it something like: `blog/performance-metrics-bundle-optimization`

## The URL will be:
```
https://res.cloudinary.com/bdougie/image/upload/v[timestamp]/blog/performance-metrics-bundle-optimization.png
```

## Or with optimizations:
```
https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/performance-metrics-bundle-optimization.png
```

## Update the blog post:
Once uploaded, replace the TODO comment in the blog post with:
```markdown
![Performance metrics showing improved LCP from 5.9s to 4.1s](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/performance-metrics-bundle-optimization.png)
```