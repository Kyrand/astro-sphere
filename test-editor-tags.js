import { chromium } from 'playwright';

async function testEditorTags() {
  console.log('Testing editor tags functionality...');
  
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
    await page.goto('http://localhost:4321/editor?edit=01-astro-sphere-file-structure');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check initial tag display (should be space-separated)
    const initialTags = await page.evaluate(() => {
      const tagsInput = document.getElementById('post-tags');
      return tagsInput ? tagsInput.value : 'Not found';
    });
    
    console.log('Initial tags value:', initialTags);
    
    // Test autocomplete
    console.log('Testing autocomplete...');
    
    // Click on tags input and clear it
    await page.click('#post-tags');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    
    // Type "A" to trigger autocomplete
    await page.type('#post-tags', 'A');
    await page.waitForTimeout(500);
    
    // Check if autocomplete appears
    const autocompleteVisible = await page.evaluate(() => {
      const autocomplete = document.getElementById('tags-autocomplete');
      return !autocomplete.classList.contains('hidden');
    });
    
    console.log('Autocomplete visible after typing "A":', autocompleteVisible);
    
    if (autocompleteVisible) {
      const suggestions = await page.evaluate(() => {
        const autocomplete = document.getElementById('tags-autocomplete');
        const items = autocomplete.querySelectorAll('.suggestion-item');
        return Array.from(items).map(item => item.textContent);
      });
      
      console.log('Autocomplete suggestions:', suggestions);
      
      // Test selecting first suggestion with Enter
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
      await page.keyboard.press('Enter');
      
      const valueAfterSelection = await page.evaluate(() => {
        const tagsInput = document.getElementById('post-tags');
        return tagsInput.value;
      });
      
      console.log('Value after selecting suggestion:', valueAfterSelection);
      
      // Test typing another tag
      await page.type('#post-tags', 'T');
      await page.waitForTimeout(500);
      
      const suggestionsForT = await page.evaluate(() => {
        const autocomplete = document.getElementById('tags-autocomplete');
        if (autocomplete.classList.contains('hidden')) return [];
        const items = autocomplete.querySelectorAll('.suggestion-item');
        return Array.from(items).map(item => item.textContent);
      });
      
      console.log('Autocomplete suggestions for "T":', suggestionsForT);
    }
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/editor-tags-test.png', fullPage: true });
    console.log('Screenshot saved to /tmp/editor-tags-test.png');
    
    // Wait for user to see
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testEditorTags().catch(console.error);