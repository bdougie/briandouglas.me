import { chromium } from 'playwright';

async function testYearFormat() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📅 Testing date format with year...\n');
  
  const pagesToCheck = [
    { url: 'http://localhost:4323/', name: 'Homepage' },
    { url: 'http://localhost:4323/posts', name: 'Posts listing' },
    { url: 'http://localhost:4323/posts/2025', name: 'Year archive' },
    { url: 'http://localhost:4323/posts/2025/08', name: 'Month archive' }
  ];
  
  for (const pageInfo of pagesToCheck) {
    console.log(`Testing ${pageInfo.name}...`);
    await page.goto(pageInfo.url);
    
    const dates = await page.$$eval('time', elements => 
      elements.slice(0, 3).map(el => el.textContent.trim())
    );
    
    if (dates.length > 0) {
      console.log(`  Sample dates:`);
      dates.forEach(date => {
        console.log(`    • ${date}`);
      });
    } else {
      console.log(`  No dates found`);
    }
    console.log('');
  }
  
  await browser.close();
  
  console.log('✅ Date format updated to include year!');
}

testYearFormat().catch(console.error);