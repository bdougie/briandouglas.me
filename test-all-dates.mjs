import { chromium } from 'playwright';

async function testAllDates() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const pagesToTest = [
    { url: 'http://localhost:4323/', name: 'Homepage' },
    { url: 'http://localhost:4323/posts', name: 'Posts page' },
    { url: 'http://localhost:4323/posts/2025', name: 'Year archive (2025)' },
    { url: 'http://localhost:4323/posts/2025/08', name: 'Month archive (Aug 2025)' },
    { url: 'http://localhost:4323/posts/2025/08/21/bluesky-comments-implementation/', name: 'Blog post' }
  ];
  
  let hasInvalidDates = false;
  
  for (const testPage of pagesToTest) {
    console.log(`\nTesting ${testPage.name}...`);
    await page.goto(testPage.url);
    
    // Get all time elements
    const timeElements = await page.$$eval('time', elements => 
      elements.map(el => el.textContent.trim())
    );
    
    if (timeElements.length === 0) {
      console.log('  No time elements found');
    } else {
      console.log(`  Found ${timeElements.length} dates:`);
      timeElements.slice(0, 5).forEach(text => {
        console.log(`    - "${text}"`);
        if (text.includes('Invalid')) {
          console.log('      ⚠️  INVALID DATE FOUND!');
          hasInvalidDates = true;
        }
      });
      if (timeElements.length > 5) {
        console.log(`    ... and ${timeElements.length - 5} more`);
      }
    }
    
    // Check for "Invalid Date" anywhere on the page
    const invalidCount = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const matches = bodyText.match(/Invalid Date/gi);
      return matches ? matches.length : 0;
    });
    
    if (invalidCount > 0) {
      console.log(`  ⚠️  Found ${invalidCount} "Invalid Date" text on page!`);
      hasInvalidDates = true;
    }
  }
  
  await browser.close();
  
  if (hasInvalidDates) {
    console.log('\n❌ INVALID DATES STILL PRESENT');
  } else {
    console.log('\n✅ ALL DATES RENDERING CORRECTLY');
  }
}

testAllDates().catch(console.error);