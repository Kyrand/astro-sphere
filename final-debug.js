import { chromium } from 'playwright';

async function finalDebug() {
  console.log('Final debug test - checking what the server-side code is doing...');
  
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
    
    console.log('Testing editor with different post slugs...');
    
    const testSlugs = [
      '01-astro-sphere-file-structure',
      '02-astro-sphere-getting-started',
      '03-astro-sphere-add-new-post-or-projects'
    ];
    
    for (const slug of testSlugs) {
      console.log(`\n--- Testing slug: ${slug} ---`);
      
      await page.goto(`http://localhost:4321/editor?edit=${slug}`);
      await page.waitForLoadState('networkidle');
      
      // Check if editPostData is available
      const result = await page.evaluate(() => {
        return {
          hasEditPostData: !!window.editPostData,
          hasFailedEditSlug: !!window.failedEditSlug,
          failedSlug: window.failedEditSlug || null,
          h1Text: document.querySelector('h1')?.textContent?.trim() || 'No h1'
        };
      });
      
      console.log('Result:', result);
      
      // Look for the scripts in the HTML
      const editPostDataScripts = await page.$$eval('script', scripts => 
        scripts.filter(script => 
          script.textContent?.includes('window.editPostData') || 
          script.textContent?.includes('window.failedEditSlug')
        ).map(script => ({
          content: script.textContent?.substring(0, 200) + '...',
          hasEditPostData: script.textContent?.includes('window.editPostData ='),
          hasFailedEditSlug: script.textContent?.includes('window.failedEditSlug =')
        }))
      );
      
      console.log('EditPostData scripts found:', editPostDataScripts.length);
      editPostDataScripts.forEach((script, i) => {
        console.log(`Script ${i+1}:`, script);
      });
      
      await page.waitForTimeout(1000);
    }
    
    // Also test the debug-posts page if it works
    console.log('\n--- Testing debug-posts page ---');
    try {
      await page.goto('http://localhost:4321/debug-posts');
      await page.waitForLoadState('networkidle');
      
      const debugPageContent = await page.evaluate(() => {
        const posts = Array.from(document.querySelectorAll('li')).map(li => li.textContent?.trim());
        const editLinks = Array.from(document.querySelectorAll("a[href*='editor']")).map(a => ({
          href: a.href,
          text: a.textContent?.trim()
        }));
        
        return { posts, editLinks };
      });
      
      console.log('Debug page posts:', debugPageContent.posts);
      console.log('Debug page edit links:', debugPageContent.editLinks);
      
    } catch (error) {
      console.log('Debug-posts page failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

finalDebug().catch(console.error);