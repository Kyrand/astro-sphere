import { chromium } from 'playwright';

async function testUserInteraction() {
  console.log('Testing actual user interaction...');
  
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
    await page.waitForTimeout(5000); // Wait longer for full initialization
    
    // Open metadata section
    console.log('Opening metadata section...');
    await page.click('#metadata-toggle');
    await page.waitForTimeout(1000);
    
    // Focus on the tags input
    console.log('Focusing on tags input...');
    await page.focus('#post-tags');
    await page.waitForTimeout(500);
    
    // Type 'A' character by character to ensure input events fire
    console.log('Typing "A"...');
    await page.keyboard.type('A');
    await page.waitForTimeout(2000); // Wait longer for autocomplete
    
    // Check autocomplete
    const autocompleteResult = await page.evaluate(() => {
      const autocomplete = document.getElementById('tags-autocomplete');
      const suggestions = autocomplete.querySelectorAll('.suggestion-item');
      return {
        isVisible: !autocomplete.classList.contains('hidden'),
        suggestions: Array.from(suggestions).map(item => item.textContent)
      };
    });
    
    console.log('Autocomplete after typing "A":', autocompleteResult);
    
    if (autocompleteResult.isVisible) {
      console.log('✅ SUCCESS! Autocomplete is working with user typing!');
      
      // Test selection
      console.log('Testing keyboard selection...');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const finalValue = await page.evaluate(() => {
        return document.getElementById('post-tags').value;
      });
      
      console.log('✅ Selected value:', finalValue);
      
      // Test second word
      console.log('Testing second word autocomplete...');
      await page.keyboard.type('T');
      await page.waitForTimeout(1000);
      
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
        console.log('✅ PERFECT! Multi-word autocomplete working!');
      }
    } else {
      console.log('❌ Autocomplete not showing after typing');
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: '/tmp/user-interaction-test.png', fullPage: true });
    console.log('Screenshot saved to /tmp/user-interaction-test.png');
    
    // Keep open for manual verification
    console.log('Keeping browser open for 15 seconds for manual verification...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testUserInteraction().catch(console.error);