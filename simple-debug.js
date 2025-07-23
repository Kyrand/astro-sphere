import { chromium } from 'playwright';

async function simpleDebug() {
  console.log('Simple debug test...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`BROWSER: ${msg.type()}: ${msg.text()}`);
    });
    
    // Test 1: Access a known blog post
    console.log('1. Testing access to a known blog post...');
    await page.goto('http://localhost:4321/blog/01-astro-sphere-file-structure');
    await page.waitForLoadState('networkidle');
    console.log('Successfully loaded blog post page');
    
    // Look for any Edit buttons
    const editButtons = await page.$$eval('*', elements => 
      elements.filter(el => 
        el.textContent?.toLowerCase().includes('edit') && 
        (el.tagName === 'BUTTON' || el.tagName === 'A')
      ).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        href: el.href || null,
        classes: el.className,
        style: el.style?.cssText || null
      }))
    );
    console.log('Edit buttons found on post page:', editButtons);
    
    // Test 2: Try direct editor access
    console.log('2. Testing direct editor access...');
    await page.goto('http://localhost:4321/editor?edit=01-astro-sphere-file-structure');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const pageTitle = await page.title();
    console.log('Editor page title:', pageTitle);
    
    // Check h1 content
    const h1Text = await page.$eval('h1', h1 => h1.textContent?.trim()).catch(() => 'No h1 found');
    console.log('Editor h1 text:', h1Text);
    
    // Check if editPostData is available
    const editPostData = await page.evaluate(() => window.editPostData);
    console.log('editPostData in window:', editPostData ? 'Available' : 'Not found');
    
    if (editPostData) {
      console.log('editPostData content:', {
        title: editPostData.data?.title,
        slug: editPostData.slug,
        hasBody: !!editPostData.body
      });
    }
    
    // Check failedEditSlug
    const failedEditSlug = await page.evaluate(() => window.failedEditSlug);
    if (failedEditSlug) {
      console.log('failedEditSlug:', failedEditSlug);
    }
    
    // Check form field values
    const formData = await page.evaluate(() => {
      const titleInput = document.getElementById('post-title');
      const summaryInput = document.getElementById('post-summary');
      const tagsInput = document.getElementById('post-tags');
      const markdownEditor = document.getElementById('markdown-editor');
      
      return {
        title: titleInput?.value || 'Empty/Not found',
        summary: summaryInput?.value || 'Empty/Not found',
        tags: tagsInput?.value || 'Empty/Not found',
        content: markdownEditor?.value ? 'Has content (' + markdownEditor.value.length + ' chars)' : 'Empty/Not found'
      };
    });
    console.log('Form field values:', formData);
    
    // Wait a bit to see any additional debug messages
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

simpleDebug().catch(console.error);