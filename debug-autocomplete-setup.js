import { chromium } from 'playwright';

async function debugAutocompleteSetup() {
  console.log('Debugging autocomplete setup...');
  
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
    await page.waitForTimeout(4000);
    
    // Check if event listeners are attached and availableTags is loaded
    const setupCheck = await page.evaluate(() => {
      const tagsInput = document.getElementById('post-tags');
      
      // Check if event listeners exist
      const hasInputListener = tagsInput._events && tagsInput._events.input;
      const hasKeydownListener = tagsInput._events && tagsInput._events.keydown;
      
      // Try to access the BlogEditor instance (if exposed)
      const editorExists = window.blogEditor !== undefined;
      
      return {
        tagsInputExists: !!tagsInput,
        hasInputListener: !!hasInputListener,
        hasKeydownListener: !!hasKeydownListener,
        editorExists,
        // Check if we can trigger the events manually
        canTriggerInput: typeof tagsInput.dispatchEvent === 'function'
      };
    });
    
    console.log('Setup check:', setupCheck);
    
    // Manually trigger the loadAvailableTags method
    console.log('Manually loading tags...');
    const manualLoad = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/get-tags');
        const data = await response.json();
        
        // Try to find and call the loadAvailableTags method
        // Since it's in the BlogEditor class, we need to simulate it
        console.log('Available tags from API:', data.tags);
        
        return { success: true, tags: data.tags };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Manual load result:', manualLoad);
    
    // Open metadata and test the input manually
    console.log('Opening metadata and testing input...');
    await page.click('#metadata-toggle');
    await page.waitForTimeout(1000);
    
    // Focus and type in the input
    await page.focus('#post-tags');
    await page.type('#post-tags', 'A');
    
    // Check if any autocomplete appears
    await page.waitForTimeout(1000);
    
    const inputResult = await page.evaluate(() => {
      const tagsInput = document.getElementById('post-tags');
      const autocomplete = document.getElementById('tags-autocomplete');
      
      // Manually trigger the input event
      const inputEvent = new Event('input', { bubbles: true });
      tagsInput.dispatchEvent(inputEvent);
      
      return {
        inputValue: tagsInput.value,
        autocompleteHidden: autocomplete.classList.contains('hidden'),
        autocompleteContent: autocomplete.innerHTML
      };
    });
    
    console.log('Input result after manual trigger:', inputResult);
    
    // Wait for inspection
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugAutocompleteSetup().catch(console.error);