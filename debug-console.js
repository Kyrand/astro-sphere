import { chromium } from 'playwright';

async function debugConsole() {
  console.log('Debugging console output from editor page...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture all console output
    const consoleMessages = [];
    page.on('console', msg => {
      const message = `[${msg.type()}] ${msg.text()}`;
      console.log(message);
      consoleMessages.push(message);
    });
    
    // Also capture page errors
    page.on('pageerror', error => {
      const message = `[PAGE ERROR] ${error.message}`;
      console.log(message);
      consoleMessages.push(message);
    });
    
    console.log('Navigating to editor page...');
    await page.goto('http://localhost:4321/editor?edit=01-astro-sphere-file-structure');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for all console messages
    await page.waitForTimeout(2000);
    
    console.log('\n=== All Console Messages ===');
    consoleMessages.forEach(msg => console.log(msg));
    console.log('============================\n');
    
    // Check page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        hasEditPostData: !!window.editPostData,
        hasFailedEditSlug: !!window.failedEditSlug,
        editSlug: new URLSearchParams(window.location.search).get('edit')
      };
    });
    
    console.log('Page content:', pageContent);
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugConsole().catch(console.error);