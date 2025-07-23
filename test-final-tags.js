import { chromium } from 'playwright';

async function testFinalTags() {
  console.log('Testing final tags functionality...');
  
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
    await page.waitForTimeout(4000);
    
    // Open metadata section
    console.log('Opening metadata section...');
    await page.click('#metadata-toggle');
    await page.waitForTimeout(500);
    
    // Check initial tag display (should be space-separated)
    const initialTags = await page.evaluate(() => {
      const tagsInput = document.getElementById('post-tags');
      return tagsInput ? tagsInput.value : 'Not found';
    });
    
    console.log('Initial tags value:', initialTags);
    
    // Clear the tags input and test autocomplete
    console.log('Testing autocomplete functionality...');
    await page.click('#post-tags');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    
    // Type "A" to trigger autocomplete  
    await page.type('#post-tags', 'A');
    await page.waitForTimeout(1000);
    
    // Check if autocomplete appears
    const autocompleteState = await page.evaluate(() => {
      const autocomplete = document.getElementById('tags-autocomplete');
      const suggestions = autocomplete.querySelectorAll('.suggestion-item');
      return {
        isVisible: !autocomplete.classList.contains('hidden'),
        suggestionsCount: suggestions.length,
        suggestions: Array.from(suggestions).map(item => item.textContent)
      };
    });
    
    console.log('Autocomplete state after typing "A":', autocompleteState);
    
    if (autocompleteState.isVisible && autocompleteState.suggestionsCount > 0) {
      console.log('✅ Autocomplete is working!');
      
      // Select first suggestion with Enter
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      await page.keyboard.press('Enter');
      
      const valueAfterSelection = await page.evaluate(() => {
        return document.getElementById('post-tags').value;
      });
      
      console.log('Value after selecting suggestion:', valueAfterSelection);
      
      // Test typing another tag
      await page.type('#post-tags', 'T');
      await page.waitForTimeout(500);
      
      const secondAutocomplete = await page.evaluate(() => {
        const autocomplete = document.getElementById('tags-autocomplete');
        const suggestions = autocomplete.querySelectorAll('.suggestion-item');
        return {
          isVisible: !autocomplete.classList.contains('hidden'),
          suggestions: Array.from(suggestions).map(item => item.textContent)
        };
      });
      
      console.log('Second autocomplete for "T":', secondAutocomplete);
      
      if (secondAutocomplete.isVisible) {
        await page.keyboard.press('Tab'); // Select first suggestion
        const finalValue = await page.evaluate(() => {
          return document.getElementById('post-tags').value;
        });
        console.log('Final tags value:', finalValue);
      }
    } else {
      console.log('❌ Autocomplete not showing');
      
      // Debug available tags
      const debugInfo = await page.evaluate(async () => {
        // Check if BlogEditor instance exists and has availableTags
        try {
          const response = await fetch('/api/get-tags');
          const data = await response.json();
          return {
            apiWorks: true,
            tags: data.tags,
            inputExists: !!document.getElementById('post-tags'),
            autocompleteExists: !!document.getElementById('tags-autocomplete')
          };
        } catch (error) {
          return { apiWorks: false, error: error.message };
        }
      });
      
      console.log('Debug info:', debugInfo);
    }
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/final-tags-test.png', fullPage: true });
    console.log('Screenshot saved to /tmp/final-tags-test.png');
    
    // Wait for user inspection
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testFinalTags().catch(console.error);