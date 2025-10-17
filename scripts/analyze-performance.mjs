#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeBundle() {
  log('📦 Analyzing bundle size...', 'blue');
  
  const distPath = './dist';
  if (!existsSync(distPath)) {
    log('❌ No dist folder found. Run npm run build first.', 'red');
    return;
  }

  try {
    // Analyze JavaScript files
    const jsFiles = execSync(`find ${distPath} -name "*.js" -type f`).toString().trim().split('\n').filter(Boolean);
    const cssFiles = execSync(`find ${distPath} -name "*.css" -type f`).toString().trim().split('\n').filter(Boolean);
    
    let totalJsSize = 0;
    let totalCssSize = 0;
    
    log('\n🟨 JavaScript Files:', 'yellow');
    jsFiles.forEach(file => {
      try {
        const stats = execSync(`stat -f%z "${file}" 2>/dev/null || stat -c%s "${file}"`).toString().trim();
        const size = parseInt(stats);
        totalJsSize += size;
        const sizeKB = (size / 1024).toFixed(1);
        const fileName = file.split('/').pop();
        
        if (size > 200 * 1024) { // > 200KB
          log(`  ⚠️  ${fileName}: ${sizeKB} KB`, 'red');
        } else if (size > 100 * 1024) { // > 100KB
          log(`  ⚡ ${fileName}: ${sizeKB} KB`, 'yellow');
        } else {
          log(`  ✅ ${fileName}: ${sizeKB} KB`, 'green');
        }
      } catch (e) {
        // Skip files we can't read
      }
    });

    log('\n🎨 CSS Files:', 'yellow');
    cssFiles.forEach(file => {
      try {
        const stats = execSync(`stat -f%z "${file}" 2>/dev/null || stat -c%s "${file}"`).toString().trim();
        const size = parseInt(stats);
        totalCssSize += size;
        const sizeKB = (size / 1024).toFixed(1);
        const fileName = file.split('/').pop();
        
        if (size > 50 * 1024) { // > 50KB
          log(`  ⚠️  ${fileName}: ${sizeKB} KB`, 'red');
        } else if (size > 25 * 1024) { // > 25KB
          log(`  ⚡ ${fileName}: ${sizeKB} KB`, 'yellow');
        } else {
          log(`  ✅ ${fileName}: ${sizeKB} KB`, 'green');
        }
      } catch (e) {
        // Skip files we can't read
      }
    });

    const totalSize = totalJsSize + totalCssSize;
    log('\n📊 Bundle Summary:', 'blue');
    log(`  Total JS: ${(totalJsSize / 1024).toFixed(1)} KB`, totalJsSize > 300 * 1024 ? 'red' : 'green');
    log(`  Total CSS: ${(totalCssSize / 1024).toFixed(1)} KB`, totalCssSize > 50 * 1024 ? 'red' : 'green');
    log(`  Combined: ${(totalSize / 1024).toFixed(1)} KB`, totalSize > 500 * 1024 ? 'red' : 'green');

    // Budget warnings
    if (totalSize > 500 * 1024) {
      log('\n⚠️  Bundle size exceeds 500KB budget!', 'red');
    } else if (totalSize > 300 * 1024) {
      log('\n⚡ Bundle size is getting large (>300KB)', 'yellow');
    } else {
      log('\n✅ Bundle size within budget', 'green');
    }

    return {
      totalJsSize,
      totalCssSize,
      totalSize,
      jsFiles: jsFiles.length,
      cssFiles: cssFiles.length
    };

  } catch (error) {
    log(`❌ Error analyzing bundle: ${error.message}`, 'red');
  }
}

function checkPerformanceOptimizations() {
  log('\n🚀 Checking performance optimizations...', 'blue');
  
  const checks = [
    {
      name: 'Netlify Image CDN configured',
      check: () => {
        try {
          const netlifyToml = readFileSync('./netlify.toml', 'utf8');
          return netlifyToml.includes('[images]');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Cache headers configured',
      check: () => {
        try {
          const netlifyToml = readFileSync('./netlify.toml', 'utf8');
          return netlifyToml.includes('Cache-Control');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Compression enabled',
      check: () => {
        try {
          const netlifyToml = readFileSync('./netlify.toml', 'utf8');
          return netlifyToml.includes('Content-Encoding');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Web Vitals tracking setup',
      check: () => {
        try {
          return existsSync('./src/utils/webVitals.ts');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Lighthouse CI configured',
      check: () => {
        try {
          return existsSync('./lighthouserc.js');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Performance monitoring function',
      check: () => {
        try {
          return existsSync('./netlify/functions/performance-metrics.mts');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Modern image formats (WebP/AVIF)',
      check: () => {
        try {
          const astroConfig = readFileSync('./astro.config.mjs', 'utf8');
          return astroConfig.includes('webp') || astroConfig.includes('avif');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Bundle chunking configured',
      check: () => {
        try {
          const astroConfig = readFileSync('./astro.config.mjs', 'utf8');
          return astroConfig.includes('manualChunks');
        } catch {
          return false;
        }
      }
    }
  ];

  let passedChecks = 0;
  checks.forEach(check => {
    const passed = check.check();
    passedChecks += passed ? 1 : 0;
    log(`  ${passed ? '✅' : '❌'} ${check.name}`, passed ? 'green' : 'red');
  });

  const score = Math.round((passedChecks / checks.length) * 100);
  log(`\n📈 Performance Optimization Score: ${score}%`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');

  return { score, passedChecks, totalChecks: checks.length };
}

function generateReport(bundleAnalysis, optimizationCheck) {
  log('\n📋 Generating performance report...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    bundle: bundleAnalysis,
    optimizations: optimizationCheck,
    recommendations: []
  };

  // Add recommendations based on analysis
  if (bundleAnalysis?.totalSize > 500 * 1024) {
    report.recommendations.push('Consider implementing code splitting or removing unused dependencies');
  }
  
  if (bundleAnalysis?.totalJsSize > 300 * 1024) {
    report.recommendations.push('JavaScript bundle is large - consider lazy loading components');
  }

  if (optimizationCheck.score < 80) {
    report.recommendations.push('Complete the performance optimization checklist above');
  }

  // Write report to file
  writeFileSync('./performance-report.json', JSON.stringify(report, null, 2));
  log('✅ Report saved to performance-report.json', 'green');

  return report;
}

function main() {
  log('🏃‍♂️ Performance Analysis Starting...', 'bold');
  log('================================', 'blue');

  const bundleAnalysis = analyzeBundle();
  const optimizationCheck = checkPerformanceOptimizations();
  const report = generateReport(bundleAnalysis, optimizationCheck);

  log('\n🎯 Next Steps:', 'blue');
  if (report.recommendations.length > 0) {
    report.recommendations.forEach(rec => log(`  • ${rec}`, 'yellow'));
  } else {
    log('  🎉 All optimizations look good!', 'green');
  }

  log('\n📊 Run Lighthouse analysis:', 'blue');
  log('  npm run lighthouse:ci', 'yellow');
  
  log('\n📈 View performance dashboard:', 'blue');
  log('  npm run performance:dashboard', 'yellow');
  
  log('\n================================', 'blue');
  log('✨ Performance Analysis Complete!', 'bold');
}

main();