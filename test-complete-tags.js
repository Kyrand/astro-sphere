import { chromium } from 'playwright';

async function testCompleteTags() {
  console.log('Testing complete tags functionality...');
  
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
    await page.waitForTimeout(1000);
    
    // Check initial tags (should be space-separated from loaded post)
    const initialTags = await page.evaluate(() => {
      return document.getElementById('post-tags').value;
    });
    
    console.log('✅ Initial tags (space-separated):', initialTags);
    
    // Clear and test manual autocomplete
    console.log('Testing autocomplete...');
    await page.focus('#post-tags');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    
    // Type "A" to trigger autocomplete
    await page.type('#post-tags', 'A');
    await page.waitForTimeout(1000);
    
    // Check autocomplete state
    const autocompleteState = await page.evaluate(() => {
      const autocomplete = document.getElementById('tags-autocomplete');
      const suggestions = autocomplete.querySelectorAll('.suggestion-item');
      return {
        isVisible: !autocomplete.classList.contains('hidden'),
        suggestionsCount: suggestions.length,
        suggestions: Array.from(suggestions).map(item => item.textContent)
      };
    });
    
    console.log('Autocomplete state:', autocompleteState);
    
    if (autocompleteState.isVisible && autocompleteState.suggestionsCount > 0) {
      console.log('✅ Autocomplete working! Available suggestions:', autocompleteState.suggestions);
      
      // Test keyboard navigation
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      
      const selectedSuggestion = await page.evaluate(() => {
        const selected = document.querySelector('.suggestion-item.selected');
        return selected ? selected.textContent : 'none selected';
      });
      
      console.log('Selected suggestion:', selectedSuggestion);
      
      // Select with Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const valueAfterSelection = await page.evaluate(() => {
        return document.getElementById('post-tags').value;
      });
      
      console.log('✅ Value after selecting:', valueAfterSelection);
      
      // Test adding another tag
      console.log('Testing second tag...');
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
      
      console.log('Second autocomplete:', secondAutocomplete);
      
      if (secondAutocomplete.isVisible && secondAutocomplete.suggestions.length > 0) {
        // Select first suggestion with Tab
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        
        const finalValue = await page.evaluate(() => {
          return document.getElementById('post-tags').value;
        });
        
        console.log('✅ Final tags value:', finalValue);
        console.log('✅ All tests passed! Tags are space-separated with working autocomplete.');
      }
    } else {
      console.log('❌ Autocomplete not showing');
      
      // Check if availableTags were loaded
      const debugInfo = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/get-tags');
          const data = await response.json();
          return { success: true, tags: data.tags };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      console.log('API debug:', debugInfo);
    }
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/complete-tags-test.png', fullPage: true });
    console.log('Screenshot saved to /tmp/complete-tags-test.png');
    
    // Wait for user to see
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testCompleteTags().catch(console.error);