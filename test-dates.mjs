import { chromium } from 'playwright';

async function testDates() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing /posts page...');
  await page.goto('http://localhost:4323/posts');
  
  // Get all time elements
  const timeElements = await page.$$eval('time', elements => 
    elements.map(el => ({
      text: el.textContent,
      class: el.className
    }))
  );
  
  console.log(`Found ${timeElements.length} time elements:`);
  timeElements.forEach((el, i) => {
    console.log(`  ${i + 1}. "${el.text}" (class: ${el.class || 'none'})`);
  });
  
  // Check for "Invalid Date" text
  const invalidDates = timeElements.filter(el => el.text.includes('Invalid'));
  if (invalidDates.length > 0) {
    console.log(`\n⚠️  Found ${invalidDates.length} Invalid Date entries!`);
  }
  
  // Now test a specific blog post
  console.log('\nTesting a specific blog post...');
  await page.goto('http://localhost:4323/posts/2025/08/21/bluesky-comments-implementation/');
  
  const postDate = await page.$eval('time', el => el.textContent);
  console.log(`Blog post date: "${postDate}"`);
  
  // Get the raw HTML to see what's actually being rendered
  const timeHTML = await page.$eval('time', el => el.outerHTML);
  console.log(`Raw HTML: ${timeHTML}`);
  
  await browser.close();
}

testDates().catch(console.error);