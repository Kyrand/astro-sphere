import { chromium } from 'playwright';

async function debugBlogEditor() {
  console.log('Starting blog editor debug...');
  
  let browser;
  try {
    // Launch browser with minimal requirements
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
    
    page.on('pageerror', error => {
      console.error(`PAGE ERROR: ${error}`);
    });
    
    console.log('1. Testing the debug page...');
    
    // Visit debug posts page
    let posts = [];
    try {
      await page.goto('http://localhost:4321/debug-posts');
      await page.waitForLoadState('networkidle');
      
      // Check what posts are available
      posts = await page.$$eval('li', items => 
        items.map(item => item.textContent?.trim()).filter(text => text.includes('Slug:'))
      );
      console.log('Available posts:', posts);
    } catch (error) {
      console.log('Error loading debug-posts page:', error.message);
      posts = [];
    }
    
    // Get edit links
    const editLinks = await page.$$eval('a[href*="/editor"]', links => 
      links.map(link => ({
        href: link.href,
        text: link.textContent?.trim()
      }))
    );
    console.log('Edit links found:', editLinks);
    
    if (editLinks.length === 0) {
      console.log('No edit links found on debug page. Checking blog index...');
      
      // Try the blog index page
      await page.goto('http://localhost:4321/blog');
      await page.waitForLoadState('networkidle');
      
      // Look for edit buttons on blog posts
      const blogEditButtons = await page.$$eval('a, button', elements => 
        elements.filter(el => 
          el.textContent?.toLowerCase().includes('edit') ||
          el.href?.includes('/editor')
        ).map(el => ({
          tag: el.tagName,
          href: el.href || null,
          text: el.textContent?.trim(),
          classes: el.className,
          onclick: el.onclick?.toString() || null,
          id: el.id || null
        }))
      );
      console.log('Edit buttons on blog page:', blogEditButtons);
      
      // If we found an "Open in editor" button, try to click it
      if (blogEditButtons.length > 0) {
        console.log('Trying to click the first edit button...');
        const firstButton = blogEditButtons[0];
        try {
          if (firstButton.tag === 'BUTTON') {
            // Try to find and click the button
            await page.click('button:has-text("Open in editor")');
            await page.waitForTimeout(2000); // Wait for any navigation
            console.log('Current URL after clicking button:', page.url());
          }
        } catch (error) {
          console.log('Error clicking edit button:', error.message);
        }
      }
      
      if (blogEditButtons.length === 0) {
        console.log('No edit buttons found on blog page either. This might be the issue.');
        console.log('Let me check a specific blog post...');
        
        // Try to visit a specific blog post
        const firstPost = posts[0];
        if (firstPost) {
          const slugMatch = firstPost.match(/Slug: (.+?) \|/);
          if (slugMatch) {
            const slug = slugMatch[1];
            console.log(`Visiting blog post: ${slug}`);
            await page.goto(`http://localhost:4321/blog/${slug}`);
            await page.waitForLoadState('networkidle');
            
            // Look for edit buttons on the post page
            const postEditButtons = await page.$$eval('a, button', elements => 
              elements.filter(el => 
                el.textContent?.toLowerCase().includes('edit') ||
                el.href?.includes('/editor')
              ).map(el => ({
                tag: el.tagName,
                href: el.href || null,
                text: el.textContent?.trim(),
                classes: el.className
              }))
            );
            console.log('Edit buttons on post page:', postEditButtons);
          }
        }
      }
    }
    
    console.log('2. Testing direct editor access...');
    
    // Test direct editor access with a post slug
    if (editLinks.length > 0) {
      const firstEditLink = editLinks[0];
      console.log(`Testing edit link: ${firstEditLink.href}`);
      
      await page.goto(firstEditLink.href);
      await page.waitForLoadState('networkidle');
      
      // Check page title
      const pageTitle = await page.title();
      console.log('Editor page title:', pageTitle);
      
      // Check h1 content
      const h1Text = await page.$eval('h1', h1 => h1.textContent?.trim()).catch(() => 'No h1 found');
      console.log('Editor h1 text:', h1Text);
      
      // Check if editPostData is available in window
      const editPostData = await page.evaluate(() => window.editPostData);
      console.log('editPostData in window:', editPostData ? 'Available' : 'Not found');
      
      if (editPostData) {
        console.log('editPostData content:', JSON.stringify(editPostData, null, 2));
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
          title: titleInput?.value || 'No title input found',
          summary: summaryInput?.value || 'No summary input found',
          tags: tagsInput?.value || 'No tags input found',
          content: markdownEditor?.value || 'No markdown editor found'
        };
      });
      console.log('Form field values:', formData);
      
      // Check browser console for any additional debug messages
      console.log('3. Waiting for any additional debug messages from the page...');
      await page.waitForTimeout(2000);
      
    } else {
      console.log('No edit links found, testing manual editor URL...');
      
      // Try to manually construct an edit URL using the first available post
      if (posts.length > 0) {
        const firstPost = posts[0];
        const slugMatch = firstPost.match(/Slug: (.+?) \|/);
        if (slugMatch) {
          const slug = slugMatch[1];
          const editUrl = `http://localhost:4321/editor?edit=${slug}`;
          console.log(`Testing manual edit URL: ${editUrl}`);
          
          await page.goto(editUrl);
          await page.waitForLoadState('networkidle');
          
          // Same checks as above
          const pageTitle = await page.title();
          console.log('Editor page title:', pageTitle);
          
          const h1Text = await page.$eval('h1', h1 => h1.textContent?.trim()).catch(() => 'No h1 found');
          console.log('Editor h1 text:', h1Text);
          
          const editPostData = await page.evaluate(() => window.editPostData);
          console.log('editPostData in window:', editPostData ? 'Available' : 'Not found');
          
          if (editPostData) {
            console.log('editPostData content:', JSON.stringify(editPostData, null, 2));
          }
          
          const failedEditSlug = await page.evaluate(() => window.failedEditSlug);
          if (failedEditSlug) {
            console.log('failedEditSlug:', failedEditSlug);
          }
          
          const formData = await page.evaluate(() => {
            const titleInput = document.getElementById('post-title');
            const summaryInput = document.getElementById('post-summary');
            const tagsInput = document.getElementById('post-tags');
            const markdownEditor = document.getElementById('markdown-editor');
            
            return {
              title: titleInput?.value || 'No title input found',
              summary: summaryInput?.value || 'No summary input found',
              tags: tagsInput?.value || 'No tags input found',
              content: markdownEditor?.value || 'No markdown editor found'
            };
          });
          console.log('Form field values:', formData);
          
          await page.waitForTimeout(2000);
        }
      }
    }
    
    console.log('Debug session completed.');
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the debug function
debugBlogEditor().catch(console.error);