import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  url: string;
  timestamp: number;
  userAgent?: string;
  connection?: string;
}

export default async (req: Request, context: Context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const store = getStore('performance-data');

  try {
    if (req.method === 'POST') {
      // Store Web Vitals data
      const vitalsData: WebVitalsData = await req.json();
      
      // Add additional context
      const enhancedData = {
        ...vitalsData,
        timestamp: Date.now(),
        userAgent: req.headers.get('User-Agent') || 'unknown',
        deployContext: context.deploy.context,
        deployId: context.deploy.id,
        geo: context.geo
      };

      // Store individual metric
      const key = `${vitalsData.name}-${enhancedData.timestamp}-${enhancedData.id}`;
      await store.setJSON(key, enhancedData);

      // Update aggregated data
      const today = new Date().toISOString().split('T')[0];
      const aggregateKey = `aggregate-${today}`;
      
      let aggregate = await store.get(aggregateKey, { type: 'json' }) || {
        date: today,
        metrics: {},
        count: 0
      };

      if (!aggregate.metrics[vitalsData.name]) {
        aggregate.metrics[vitalsData.name] = {
          values: [],
          p75: 0,
          p90: 0,
          p95: 0,
          average: 0
        };
      }

      aggregate.metrics[vitalsData.name].values.push(vitalsData.value);
      aggregate.count++;

      // Calculate percentiles
      const values = aggregate.metrics[vitalsData.name].values.sort((a, b) => a - b);
      const len = values.length;
      
      aggregate.metrics[vitalsData.name].p75 = values[Math.floor(len * 0.75)];
      aggregate.metrics[vitalsData.name].p90 = values[Math.floor(len * 0.9)];
      aggregate.metrics[vitalsData.name].p95 = values[Math.floor(len * 0.95)];
      aggregate.metrics[vitalsData.name].average = values.reduce((a, b) => a + b, 0) / len;

      await store.setJSON(aggregateKey, aggregate);

      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers 
      });
    }

    if (req.method === 'GET') {
      // Return performance dashboard data
      const url = new URL(req.url);
      const days = parseInt(url.searchParams.get('days') || '7');
      
      const recentData = [];
      const now = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const aggregateKey = `aggregate-${dateStr}`;
        
        const dayData = await store.get(aggregateKey, { type: 'json' });
        if (dayData) {
          recentData.push(dayData);
        }
      }

      // Get recent individual metrics for real-time view
      const { blobs } = await store.list({ prefix: 'LCP-' });
      const recentLCP = blobs.slice(-10);

      const dashboardData = {
        aggregated: recentData,
        recent: recentLCP,
        summary: recentData.length > 0 ? {
          totalSessions: recentData.reduce((sum, day) => sum + day.count, 0),
          avgLCP: recentData
            .filter(d => d.metrics.LCP)
            .reduce((sum, day) => sum + day.metrics.LCP.p75, 0) / 
            recentData.filter(d => d.metrics.LCP).length || 0,
          avgCLS: recentData
            .filter(d => d.metrics.CLS)
            .reduce((sum, day) => sum + day.metrics.CLS.p75, 0) / 
            recentData.filter(d => d.metrics.CLS).length || 0,
          avgFID: recentData
            .filter(d => d.metrics.FID)
            .reduce((sum, day) => sum + day.metrics.FID.p75, 0) / 
            recentData.filter(d => d.metrics.FID).length || 0
        } : null
      };

      return new Response(JSON.stringify(dashboardData), { 
        status: 200, 
        headers 
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500, 
      headers 
    });
  }
};

export const config: Config = {
  path: "/api/performance"
};