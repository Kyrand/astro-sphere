import { chromium } from 'playwright';

async function testEditorFinal() {
  console.log('Final test of editor functionality...');
  
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
    
    // Wait for editor to initialize and load data
    await page.waitForTimeout(3000);
    
    // Check if post data loaded
    const editorState = await page.evaluate(() => {
      const titleInput = document.getElementById('post-title');
      const summaryInput = document.getElementById('post-summary');
      const tagsInput = document.getElementById('post-tags');
      const markdownEditor = document.getElementById('markdown-editor');
      
      return {
        title: titleInput?.value || 'Not found',
        summary: summaryInput?.value || 'Not found',
        tags: tagsInput?.value || 'Not found',
        contentLength: markdownEditor?.value?.length || 0,
        contentPreview: markdownEditor?.value?.substring(0, 100) || 'No content'
      };
    });
    
    console.log('\n=== Editor State ===');
    console.log('Title:', editorState.title);
    console.log('Summary:', editorState.summary);
    console.log('Tags:', editorState.tags);
    console.log('Content length:', editorState.contentLength);
    console.log('Content preview:', editorState.contentPreview);
    console.log('==================\n');
    
    // Test metadata toggle
    console.log('Testing metadata toggle...');
    await page.click('#metadata-toggle');
    await page.waitForTimeout(500);
    
    const metadataVisible = await page.evaluate(() => {
      const metadataContent = document.getElementById('metadata-content');
      return !metadataContent.classList.contains('hidden');
    });
    
    console.log('Metadata visible after toggle:', metadataVisible);
    
    // Test tab switching
    console.log('Testing preview tab...');
    await page.click('#preview-tab');
    await page.waitForTimeout(1000);
    
    const previewVisible = await page.evaluate(() => {
      const previewContent = document.getElementById('preview-content');
      const editorContent = document.getElementById('editor-content');
      return !previewContent.classList.contains('hidden') && editorContent.classList.contains('hidden');
    });
    
    console.log('Preview mode active:', previewVisible);
    
    // Take a screenshot for manual verification
    await page.screenshot({ path: '/tmp/editor-test.png', fullPage: true });
    console.log('Screenshot saved to /tmp/editor-test.png');
    
    // Wait a bit for user to see the result
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testEditorFinal().catch(console.error);