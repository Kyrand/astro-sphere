import { test, expect } from '@playwright/test';

test.describe('Code Block Highlighting', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:4327/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should have syntax highlighted code blocks with proper span tags', async ({ page }) => {
    // Look for code blocks in article previews
    const codeBlocks = page.locator('pre code, .prose code');
    
    // Wait for at least one code block to be present
    await expect(codeBlocks.first()).toBeVisible();
    
    // Check if we have any code blocks
    const codeBlockCount = await codeBlocks.count();
    console.log(`Found ${codeBlockCount} code blocks`);
    
    if (codeBlockCount > 0) {
      // Get the first code block
      const firstCodeBlock = codeBlocks.first();
      
      // Check if it contains span elements with color styles
      const spanElements = firstCodeBlock.locator('span.line, span[style*="color"]');
      const spanCount = await spanElements.count();
      
      console.log(`Found ${spanCount} span elements with styling`);
      
      // Verify that we have syntax highlighting spans
      await expect(spanElements.first()).toBeVisible();
      
      // Check for specific color styles that indicate syntax highlighting
      const coloredSpans = firstCodeBlock.locator('span[style*="color:#"]');
      const coloredSpanCount = await coloredSpans.count();
      
      console.log(`Found ${coloredSpanCount} spans with color styles`);
      expect(coloredSpanCount).toBeGreaterThan(0);
      
      // Get the HTML content of the first code block to inspect
      const codeBlockHTML = await firstCodeBlock.innerHTML();
      console.log('Code block HTML preview:', codeBlockHTML.substring(0, 500) + '...');
      
      // Verify that the HTML contains expected syntax highlighting patterns
      expect(codeBlockHTML).toMatch(/span.*style.*color:#[0-9A-Fa-f]{6}/);
      expect(codeBlockHTML).toMatch(/class="line"/);
    }
  });

  test('should have different colors for different syntax elements', async ({ page }) => {
    // Look for code blocks
    const codeBlocks = page.locator('pre code, .prose code');
    
    if (await codeBlocks.count() > 0) {
      const firstCodeBlock = codeBlocks.first();
      
      // Check for different color values to ensure various syntax elements are highlighted
      const uniqueColors = await firstCodeBlock.locator('span[style*="color:#"]').evaluateAll(
        (elements) => {
          const colors = new Set();
          elements.forEach(el => {
            const style = el.getAttribute('style');
            const colorMatch = style?.match(/color:#([0-9A-Fa-f]{6})/);
            if (colorMatch) {
              colors.add(colorMatch[1]);
            }
          });
          return Array.from(colors);
        }
      );
      
      console.log('Unique colors found:', uniqueColors);
      
      // We should have multiple colors for different syntax elements
      expect(uniqueColors.length).toBeGreaterThan(1);
      
      // Check for common syntax highlighting colors
      const colorString = uniqueColors.join(',');
      // These colors should appear in typical syntax highlighting
      expect(colorString).toMatch(/6A737D|F97583|B392F0|9ECBFF|79B8FF|E1E4E8/);
    }
  });

  test('should preserve code block structure', async ({ page }) => {
    const codeBlocks = page.locator('pre code, .prose code');
    
    if (await codeBlocks.count() > 0) {
      const firstCodeBlock = codeBlocks.first();
      
      // Verify the basic structure matches the expected format
      const html = await firstCodeBlock.innerHTML();
      
      // Should have line spans
      expect(html).toContain('class="line"');
      
      // Should have nested spans with color styles
      expect(html).toMatch(/<span class="line"><span style="color:#[0-9A-Fa-f]{6}">/);
      
      console.log('Code block structure verified');
    }
  });
});