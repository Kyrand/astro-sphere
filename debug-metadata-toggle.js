import { chromium } from 'playwright';

async function debugMetadataToggle() {
  console.log('Debugging metadata toggle...');
  
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
    
    console.log('Loading editor page...');
    await page.goto('http://localhost:4321/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check the state before clicking
    const beforeClick = await page.evaluate(() => {
      const toggle = document.getElementById('metadata-toggle');
      const content = document.getElementById('metadata-content');
      const chevron = document.getElementById('metadata-chevron');
      
      return {
        toggleExists: !!toggle,
        contentExists: !!content,
        chevronExists: !!chevron,
        contentIsHidden: content ? content.classList.contains('hidden') : 'not found',
        contentDisplay: content ? getComputedStyle(content).display : 'not found',
        chevronTransform: chevron ? chevron.style.transform : 'not found'
      };
    });
    
    console.log('Before click:', beforeClick);
    
    // Try to click the metadata toggle
    console.log('Clicking metadata toggle...');
    await page.click('#metadata-toggle');
    await page.waitForTimeout(1000);
    
    // Check the state after clicking
    const afterClick = await page.evaluate(() => {
      const content = document.getElementById('metadata-content');
      const chevron = document.getElementById('metadata-chevron');
      const tagsInput = document.getElementById('post-tags');
      
      return {
        contentIsHidden: content ? content.classList.contains('hidden') : 'not found',
        contentDisplay: content ? getComputedStyle(content).display : 'not found',
        chevronTransform: chevron ? chevron.style.transform : 'not found',
        tagsInputVisible: tagsInput ? !tagsInput.offsetParent === null : 'not found'
      };
    });
    
    console.log('After click:', afterClick);
    
    // Force show the metadata section
    console.log('Force showing metadata section...');
    await page.evaluate(() => {
      const content = document.getElementById('metadata-content');
      if (content) {
        content.classList.remove('hidden');
        content.style.display = 'block';
      }
    });
    
    await page.waitForTimeout(500);
    
    // Now test if tags input is accessible
    const finalCheck = await page.evaluate(() => {
      const tagsInput = document.getElementById('post-tags');
      return {
        tagsInputExists: !!tagsInput,
        tagsInputVisible: tagsInput ? tagsInput.getBoundingClientRect().height > 0 : false,
        tagsInputValue: tagsInput ? tagsInput.value : 'not found'
      };
    });
    
    console.log('Final check:', finalCheck);
    
    if (finalCheck.tagsInputVisible) {
      console.log('Testing tags input...');
      await page.focus('#post-tags');
      await page.type('#post-tags', 'Test');
      
      const typed = await page.evaluate(() => {
        return document.getElementById('post-tags').value;
      });
      
      console.log('Typed value:', typed);
    }
    
    // Wait for user to see
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugMetadataToggle().catch(console.error);