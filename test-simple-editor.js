import { chromium } from 'playwright';

async function testSimpleEditor() {
  console.log('Testing simple editor page...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('http://localhost:4321/editor-simple?edit=test-slug-123');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const pageContent = await page.evaluate(() => {
      return {
        hasEditPostData: !!window.editPostData,
        editSlugDisplay: document.getElementById('edit-slug-display')?.textContent,
        editPostData: window.editPostData
      };
    });
    
    console.log('Page content:', pageContent);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testSimpleEditor().catch(console.error);