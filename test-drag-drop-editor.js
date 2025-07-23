import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { join } from 'path';

async function testDragDropEditor() {
  console.log('Testing drag and drop functionality in markdown editor...');
  
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
    
    // Check if the drop zone is removed
    const dropZoneExists = await page.evaluate(() => {
      return !!document.getElementById('drop-zone');
    });
    
    console.log('Drop zone removed:', !dropZoneExists);
    
    // Check the markdown editor placeholder
    const placeholder = await page.evaluate(() => {
      const editor = document.getElementById('markdown-editor');
      return editor ? editor.placeholder : 'not found';
    });
    
    console.log('Markdown editor placeholder:', placeholder);
    
    // Add some initial text to the editor
    console.log('Adding initial text to editor...');
    await page.focus('#markdown-editor');
    await page.type('#markdown-editor', 'Here is some initial text.\n\n');
    
    // Move cursor to middle of text
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    
    const initialContent = await page.evaluate(() => {
      return document.getElementById('markdown-editor').value;
    });
    
    console.log('Initial content:', initialContent);
    
    // Test drag enter/leave visual feedback
    console.log('Testing drag visual feedback...');
    
    // Simulate drag enter
    await page.evaluate(() => {
      const editor = document.getElementById('markdown-editor');
      const dragEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      });
      editor.dispatchEvent(dragEvent);
    });
    
    await page.waitForTimeout(500);
    
    const hasDragOverClass = await page.evaluate(() => {
      const editor = document.getElementById('markdown-editor');
      return editor.classList.contains('drag-over');
    });
    
    console.log('Drag over visual feedback working:', hasDragOverClass);
    
    // Simulate drag leave
    await page.evaluate(() => {
      const editor = document.getElementById('markdown-editor');
      const dragEvent = new DragEvent('dragleave', {
        bubbles: true,
        cancelable: true,
        relatedTarget: document.body
      });
      editor.dispatchEvent(dragEvent);
    });
    
    await page.waitForTimeout(500);
    
    const dragOverRemoved = await page.evaluate(() => {
      const editor = document.getElementById('markdown-editor');
      return !editor.classList.contains('drag-over');
    });
    
    console.log('Drag over class removed on leave:', dragOverRemoved);
    
    // Test drop functionality by simulating a file drop
    console.log('Testing file drop simulation...');
    
    const dropResult = await page.evaluate(() => {
      const editor = document.getElementById('markdown-editor');
      
      // Create a mock file
      const file = new File(['fake image data'], 'test-image.png', { type: 'image/png' });
      
      // Create DataTransfer with the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Set cursor position in middle of text
      editor.focus();
      editor.setSelectionRange(25, 25); // After "Here is some initial text."
      
      // Create drop event
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
        clientX: 300,
        clientY: 200
      });
      
      editor.dispatchEvent(dropEvent);
      
      return {
        cursorPosition: editor.selectionStart,
        contentAfterDrop: editor.value
      };
    });
    
    console.log('Drop result:', {
      cursorWasAt: 25,
      contentPreview: dropResult.contentAfterDrop.substring(0, 100) + '...'
    });
    
    // Check if image markdown was inserted
    const hasImageMarkdown = dropResult.contentAfterDrop.includes('![test-image.png]');
    console.log('Image markdown inserted:', hasImageMarkdown);
    
    // Take screenshot for manual verification
    await page.screenshot({ path: '/tmp/drag-drop-editor-test.png', fullPage: true });
    console.log('Screenshot saved to /tmp/drag-drop-editor-test.png');
    
    if (!dropZoneExists && hasDragOverClass && dragOverRemoved && hasImageMarkdown) {
      console.log('✅ All drag and drop tests passed!');
      console.log('✅ Drop zone removed');
      console.log('✅ Visual feedback working');
      console.log('✅ Image insertion working');
    } else {
      console.log('❌ Some tests failed');
    }
    
    // Keep browser open for manual testing
    console.log('Browser will stay open for 20 seconds for manual testing...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testDragDropEditor().catch(console.error);