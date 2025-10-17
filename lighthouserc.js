module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4321',
        'http://localhost:4321/posts',
        'http://localhost:4321/posts/2025'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerTimeout: 120000,
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Core Web Vitals budgets
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        
        // Bundle size budgets
        'total-byte-weight': ['error', { maxNumericValue: 500000 }], // 500KB
        'unused-javascript': ['warn', { maxNumericValue: 200000 }], // 200KB
        'modern-image-formats': 'error',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'warn',
        
        // Other performance metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn'
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-reports'
    },
    server: {
      port: 9001,
      storage: './lighthouse-reports'
    }
  }
};