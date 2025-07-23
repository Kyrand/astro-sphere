import { chromium } from 'playwright';

async function debugHomepage() {
  console.log('Debugging homepage to see why articles are not shown...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    console.log('Loading homepage...');
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check what's actually on the page
    const pageContent = await page.evaluate(() => {
      // Look for article containers, lists, etc.
      const searchCollection = document.querySelector('[data-component="SearchCollection"]');
      const articleElements = document.querySelectorAll('article, .article, [class*="post"], [class*="article"]');
      const listElements = document.querySelectorAll('ul, ol');
      const divElements = document.querySelectorAll('div[class*="animate"]');
      
      return {
        title: document.title,
        bodyText: document.body.textContent.substring(0, 500),
        searchCollectionExists: !!searchCollection,
        articleCount: articleElements.length,
        listCount: listElements.length, 
        animatedDivs: divElements.length,
        visibleText: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && 
          el.textContent.trim().length > 10 && 
          el.offsetParent !== null &&
          !el.querySelector('*')
        ).slice(0, 10).map(el => el.textContent.trim().substring(0, 100))
      };
    });
    
    console.log('\n=== Homepage Debug Info ===');
    console.log('Title:', pageContent.title);
    console.log('Has SearchCollection:', pageContent.searchCollectionExists);
    console.log('Article elements found:', pageContent.articleCount);
    console.log('List elements found:', pageContent.listCount);
    console.log('Animated divs found:', pageContent.animatedDivs);
    console.log('\nVisible text elements:');
    pageContent.visibleText.forEach((text, i) => {
      console.log(`${i+1}. ${text}`);
    });
    console.log('\nFirst 500 chars of body text:');
    console.log(pageContent.bodyText);
    console.log('===========================\n');
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/homepage-debug.png', fullPage: true });
    console.log('Screenshot saved to /tmp/homepage-debug.png');
    
    // Wait for user to see
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugHomepage().catch(console.error);