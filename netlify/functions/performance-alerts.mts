import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

interface AlertThresholds {
  lcp: number; // ms
  cls: number; // score
  fid: number; // ms
  inp: number; // ms
  consecutiveFailures: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  lcp: 3000, // Alert if P75 LCP > 3s
  cls: 0.15, // Alert if P75 CLS > 0.15
  fid: 200,  // Alert if P75 FID > 200ms
  inp: 300,  // Alert if P75 INP > 300ms
  consecutiveFailures: 3 // Alert after 3 consecutive failures
};

export default async (req: Request, context: Context) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const store = getStore('performance-data');
    const alertStore = getStore('performance-alerts');
    
    // Get recent performance data
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [todayData, yesterdayData] = await Promise.all([
      store.get(`aggregate-${today}`, { type: 'json' }),
      store.get(`aggregate-${yesterday}`, { type: 'json' })
    ]);

    const alerts = [];
    const thresholds = DEFAULT_THRESHOLDS;

    // Check current day's performance
    if (todayData && todayData.metrics) {
      const { metrics } = todayData;
      
      // Check LCP
      if (metrics.LCP && metrics.LCP.p75 > thresholds.lcp) {
        alerts.push({
          type: 'lcp_threshold',
          severity: 'high',
          metric: 'LCP',
          currentValue: metrics.LCP.p75,
          threshold: thresholds.lcp,
          message: `LCP P75 is ${Math.round(metrics.LCP.p75)}ms (threshold: ${thresholds.lcp}ms)`
        });
      }

      // Check CLS
      if (metrics.CLS && metrics.CLS.p75 > thresholds.cls) {
        alerts.push({
          type: 'cls_threshold',
          severity: 'high',
          metric: 'CLS',
          currentValue: metrics.CLS.p75,
          threshold: thresholds.cls,
          message: `CLS P75 is ${metrics.CLS.p75.toFixed(3)} (threshold: ${thresholds.cls})`
        });
      }

      // Check FID
      if (metrics.FID && metrics.FID.p75 > thresholds.fid) {
        alerts.push({
          type: 'fid_threshold',
          severity: 'medium',
          metric: 'FID',
          currentValue: metrics.FID.p75,
          threshold: thresholds.fid,
          message: `FID P75 is ${Math.round(metrics.FID.p75)}ms (threshold: ${thresholds.fid}ms)`
        });
      }

      // Check INP
      if (metrics.INP && metrics.INP.p75 > thresholds.inp) {
        alerts.push({
          type: 'inp_threshold',
          severity: 'high',
          metric: 'INP',
          currentValue: metrics.INP.p75,
          threshold: thresholds.inp,
          message: `INP P75 is ${Math.round(metrics.INP.p75)}ms (threshold: ${thresholds.inp}ms)`
        });
      }
    }

    // Compare with yesterday for regression detection
    if (todayData && yesterdayData && todayData.metrics && yesterdayData.metrics) {
      const todayMetrics = todayData.metrics;
      const yesterdayMetrics = yesterdayData.metrics;

      // Check for significant regressions (>20% increase)
      ['LCP', 'FID', 'INP'].forEach(metric => {
        if (todayMetrics[metric] && yesterdayMetrics[metric]) {
          const todayValue = todayMetrics[metric].p75;
          const yesterdayValue = yesterdayMetrics[metric].p75;
          const percentIncrease = ((todayValue - yesterdayValue) / yesterdayValue) * 100;

          if (percentIncrease > 20) {
            alerts.push({
              type: 'regression',
              severity: 'medium',
              metric,
              currentValue: todayValue,
              previousValue: yesterdayValue,
              percentIncrease: Math.round(percentIncrease),
              message: `${metric} regressed by ${Math.round(percentIncrease)}% since yesterday`
            });
          }
        }
      });

      // Check for CLS regression (>0.05 increase)
      if (todayMetrics.CLS && yesterdayMetrics.CLS) {
        const todayValue = todayMetrics.CLS.p75;
        const yesterdayValue = yesterdayMetrics.CLS.p75;
        const increase = todayValue - yesterdayValue;

        if (increase > 0.05) {
          alerts.push({
            type: 'cls_regression',
            severity: 'medium',
            metric: 'CLS',
            currentValue: todayValue,
            previousValue: yesterdayValue,
            increase: increase.toFixed(3),
            message: `CLS increased by ${increase.toFixed(3)} since yesterday`
          });
        }
      }
    }

    // Store alerts
    if (alerts.length > 0) {
      const alertData = {
        timestamp: new Date().toISOString(),
        date: today,
        alerts,
        deployId: context.deploy.id,
        deployContext: context.deploy.context
      };

      await alertStore.setJSON(`alerts-${today}-${Date.now()}`, alertData);

      // In a real implementation, you might want to send these alerts to:
      // - Slack webhook
      // - Discord webhook  
      // - Email service
      // - PagerDuty
      // - Custom monitoring service

      console.log('Performance alerts generated:', alerts);
    }

    return new Response(JSON.stringify({
      success: true,
      alertsGenerated: alerts.length,
      alerts: alerts
    }), { 
      status: 200, 
      headers 
    });

  } catch (error) {
    console.error('Performance alerts error:', error);
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
  schedule: "0 8 * * *" // Run daily at 8 AM UTC
};