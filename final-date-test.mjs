import { chromium } from 'playwright';

async function finalDateTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 Final Date Rendering Test\n');
  console.log('Testing http://localhost:4323/posts...');
  
  await page.goto('http://localhost:4323/posts');
  
  // Check page content for "Invalid Date" text
  const pageContent = await page.evaluate(() => document.body.innerText);
  const hasInvalidDate = pageContent.includes('Invalid Date');
  
  // Get all dates from time elements
  const dates = await page.$$eval('time', elements => 
    elements.map(el => el.textContent.trim())
  );
  
  console.log(`\n📊 Results:`);
  console.log(`- Found ${dates.length} date elements`);
  console.log(`- Sample dates: ${dates.slice(0, 5).join(', ')}`);
  console.log(`- Contains "Invalid Date": ${hasInvalidDate ? '❌ YES' : '✅ NO'}`);
  
  // Check for any Invalid dates in the array
  const invalidDates = dates.filter(d => d.includes('Invalid'));
  if (invalidDates.length > 0) {
    console.log(`\n⚠️  Found ${invalidDates.length} invalid dates:`);
    invalidDates.forEach(d => console.log(`  - "${d}"`));
  }
  
  await browser.close();
  
  console.log('\n' + '='.repeat(50));
  if (hasInvalidDate || invalidDates.length > 0) {
    console.log('❌ DATES STILL HAVE ISSUES');
    console.log('\nTroubleshooting steps:');
    console.log('1. Clear browser cache');
    console.log('2. Restart dev server: Ctrl+C then npm run dev');
    console.log('3. Check that all files are saved');
  } else {
    console.log('✅ ALL DATES ARE RENDERING CORRECTLY!');
    console.log('\nThe date formatting issue has been fixed.');
  }
  console.log('='.repeat(50));
}

finalDateTest().catch(console.error);