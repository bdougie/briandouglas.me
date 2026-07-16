#!/usr/bin/env node

/**
 * Benchmark OG card generation and serving latency.
 *
 * Usage:
 *   node scripts/og-bench.mjs            # render benchmark (all published posts)
 *   node scripts/og-bench.mjs --http     # also compare serving latency:
 *                                        #   Cloudinary (old) vs briandouglas.me/og (new)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateOGImage } from './lib/og-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '../src/content/posts');

function getPosts() {
  return fs.readdirSync(postsDir)
    .filter(f => /\.(md|mdx)$/.test(f))
    .map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const fm = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      if (/^draft:\s*(true|"true"|'true')/m.test(fm)) return null;
      let title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim();
      if (!title) return null;
      title = title.replace(/^["']|["']$/g, '');
      const slug = file.replace(/\.(mdx?|md)$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return { slug, title };
    })
    .filter(Boolean);
}

function stats(times) {
  const sorted = [...times].sort((a, b) => a - b);
  const pick = q => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  return {
    min: sorted[0],
    p50: pick(0.5),
    p95: pick(0.95),
    max: sorted[sorted.length - 1],
    total: times.reduce((a, b) => a + b, 0),
  };
}

const fmt = ms => `${ms.toFixed(0)}ms`;

async function renderBench(posts) {
  console.log(`\n=== Render benchmark (${posts.length} published posts) ===`);

  // First render includes one-time font load
  const t0 = performance.now();
  await generateOGImage({ title: posts[0].title });
  const firstRender = performance.now() - t0;

  const times = [];
  const start = performance.now();
  for (const post of posts) {
    const t = performance.now();
    await generateOGImage({ title: post.title });
    times.push(performance.now() - t);
  }
  const wallClock = performance.now() - start;

  const s = stats(times);
  console.log(`first render (incl. font load): ${fmt(firstRender)}`);
  console.log(`per card: min ${fmt(s.min)} / p50 ${fmt(s.p50)} / p95 ${fmt(s.p95)} / max ${fmt(s.max)}`);
  console.log(`all ${posts.length} cards: ${(wallClock / 1000).toFixed(1)}s (added to each build)`);
}

async function timeFetch(url) {
  const t = performance.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    await res.arrayBuffer();
    return { ms: performance.now() - t, status: res.status, cache: res.headers.get('x-cache') || res.headers.get('cache-status') || '' };
  } catch {
    return { ms: performance.now() - t, status: 0, cache: 'error/timeout' };
  }
}

async function httpBench(posts) {
  const sample = posts.slice(-8);
  const targets = [
    { name: 'Cloudinary (old)', url: s => `https://res.cloudinary.com/bdougie/image/upload/og/${s}.png` },
    { name: 'briandouglas.me/og (new)', url: s => `https://briandouglas.me/og/${s}.png` },
  ];

  console.log(`\n=== Serving latency (${sample.length} recent posts, 2 passes each) ===`);
  for (const target of targets) {
    const cold = [];
    const warm = [];
    let failures = 0;
    for (const { slug } of sample) {
      const a = await timeFetch(target.url(slug));
      const b = await timeFetch(target.url(slug));
      if (a.status !== 200) failures++;
      else { cold.push(a.ms); warm.push(b.ms); }
    }
    if (cold.length === 0) {
      console.log(`${target.name}: all requests failed (route not deployed yet?)`);
      continue;
    }
    const c = stats(cold);
    const w = stats(warm);
    console.log(`${target.name}: pass1 p50 ${fmt(c.p50)} max ${fmt(c.max)} | pass2 p50 ${fmt(w.p50)} max ${fmt(w.max)}${failures ? ` | ${failures} non-200` : ''}`);
  }
}

const posts = getPosts();
await renderBench(posts);
if (process.argv.includes('--http')) {
  await httpBench(posts);
}
