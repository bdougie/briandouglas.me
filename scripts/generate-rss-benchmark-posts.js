import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('src/pages/posts');
const COUNT = 2000;

if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Directory ${POSTS_DIR} does not exist.`);
    process.exit(1);
}

console.log(`Generating ${COUNT} dummy posts in ${POSTS_DIR}...`);

for (let i = 0; i < COUNT; i++) {
  const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
  const filename = `${date}-benchmark-post-${i}.md`;
  const content = `---
title: "Benchmark Post ${i}"
date: "${date}"
description: "This is a benchmark post."
---

# Benchmark Post ${i}

Content for benchmark post ${i}.
`;
  fs.writeFileSync(path.join(POSTS_DIR, filename), content);
}

console.log('Done.');
