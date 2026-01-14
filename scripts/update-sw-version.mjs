#!/usr/bin/env node
/**
 * Updates the service worker cache version to match the current git commit.
 * This ensures browsers get fresh content after each deploy without manual version bumps.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = join(__dirname, '..', 'public', 'sw.js');

// Get short commit SHA for version
const version = execSync('git rev-parse --short=7 HEAD').toString().trim();

console.log(`Updating service worker cache version to: ${version}`);

let swContent = readFileSync(swPath, 'utf-8');

// Update both cache names
swContent = swContent.replace(
  /const CACHE_NAME = 'briandouglas-[^']+'/,
  `const CACHE_NAME = 'briandouglas-${version}'`
);
swContent = swContent.replace(
  /const IMAGE_CACHE_NAME = 'briandouglas-images-[^']+'/,
  `const IMAGE_CACHE_NAME = 'briandouglas-images-${version}'`
);

writeFileSync(swPath, swContent);

console.log('Service worker cache version updated successfully');
