import { chromium } from 'playwright';

async function debugTagsAutocomplete() {
  console.log('Debugging tags autocomplete...');
  
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
    
    // Check if the BlogEditor loaded and has available tags
    const debugInfo = await page.evaluate(() => {
      // Try to access the editor instance
      const tagsInput = document.getElementById('post-tags');
      const autocomplete = document.getElementById('tags-autocomplete');
      
      return {
        tagsInputExists: !!tagsInput,
        autocompleteExists: !!autocomplete,
        // Try to check if BlogEditor instance exists
        hasListeners: tagsInput ? tagsInput.oninput !== null : false
      };
    });
    
    console.log('Debug info:', debugInfo);
    
    // Test the API endpoint directly from the page
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/get-tags');
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('API response from page:', apiResponse);
    
    // Test manual input
    console.log('Testing manual input...');
    await page.click('#post-tags');
    await page.type('#post-tags', 'A');
    await page.waitForTimeout(1000);
    
    const afterTyping = await page.evaluate(() => {
      const autocomplete = document.getElementById('tags-autocomplete');
      return {
        isHidden: autocomplete.classList.contains('hidden'),
        innerHTML: autocomplete.innerHTML,
        className: autocomplete.className
      };
    });
    
    console.log('After typing "A":', afterTyping);
    
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

debugTagsAutocomplete().catch(console.error);