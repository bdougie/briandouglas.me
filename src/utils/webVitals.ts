import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Function to send metrics to your performance endpoint
function sendToAnalytics(metric: Metric) {
  // Only send in production
  if (typeof window === 'undefined' || window.location.hostname === 'localhost') {
    console.log('Web Vitals (dev):', metric);
    return;
  }

  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    url: window.location.href,
    timestamp: Date.now()
  });

  // Use Navigator.sendBeacon() if available, falling back to fetch()
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/performance', body);
  } else {
    fetch('/api/performance', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json'
      },
      keepalive: true
    }).catch(console.error);
  }
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  try {
    // Core Web Vitals
    onCLS(sendToAnalytics);  // Cumulative Layout Shift
    onFCP(sendToAnalytics);  // First Contentful Paint
    onFID(sendToAnalytics);  // First Input Delay (deprecated, use INP)
    onINP(sendToAnalytics);  // Interaction to Next Paint
    onLCP(sendToAnalytics);  // Largest Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

// Helper function to get Core Web Vitals rating
export function getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

// Performance observer for additional metrics
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Long tasks observer (for tracking blocking time)
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            sendToAnalytics({
              name: 'long-task',
              value: entry.duration,
              rating: entry.duration > 50 ? 'poor' : 'good',
              delta: 0,
              id: `lt-${Date.now()}`,
            } as Metric);
          }
        }
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
  }

  // Resource timing observer (for tracking slow resources)
  try {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.duration > 1000) { // Resources taking > 1s
          sendToAnalytics({
            name: 'slow-resource',
            value: resourceEntry.duration,
            rating: 'poor',
            delta: 0,
            id: `sr-${Date.now()}`,
          } as Metric);
        }
      }
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  } catch (e) {
    // Resource timing not supported
  }
}