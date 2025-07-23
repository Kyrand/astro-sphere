import { chromium } from 'playwright';

async function compareFullRendering() {
  console.log('Comparing full rendering between blog post and preview...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    
    // Open blog post
    const blogPage = await context.newPage();
    await blogPage.goto('http://localhost:4321/blog/04-astro-sphere-writing-markdown');
    await blogPage.waitForLoadState('networkidle');
    
    // Open editor preview
    const editorPage = await context.newPage();
    await editorPage.goto('http://localhost:4321/editor?edit=04-astro-sphere-writing-markdown');
    await editorPage.waitForLoadState('networkidle');
    await editorPage.waitForTimeout(2000);
    await editorPage.click('#preview-tab');
    await editorPage.waitForTimeout(1000);
    
    // Analyze blog post content
    const blogAnalysis = await blogPage.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return { error: 'No article found' };
      
      return {
        headings: {
          h1: article.querySelectorAll('h1').length,
          h2: article.querySelectorAll('h2').length,
          h3: article.querySelectorAll('h3').length,
          h4: article.querySelectorAll('h4').length,
          h5: article.querySelectorAll('h5').length,
          h6: article.querySelectorAll('h6').length,
        },
        blockquotes: article.querySelectorAll('blockquote').length,
        tables: article.querySelectorAll('table').length,
        lists: {
          ul: article.querySelectorAll('ul').length,
          ol: article.querySelectorAll('ol').length
        },
        images: article.querySelectorAll('img').length,
        codeBlocks: article.querySelectorAll('pre code').length,
        links: article.querySelectorAll('a').length,
        paragraphs: article.querySelectorAll('p').length
      };
    });
    
    // Analyze preview content
    const previewAnalysis = await editorPage.evaluate(() => {
      const preview = document.getElementById('preview-html');
      if (!preview) return { error: 'No preview found' };
      
      // Check for raw markdown that wasn't processed (exclude content inside code blocks)
      const html = preview.innerHTML;
      
      // Remove code blocks from HTML for analysis
      const htmlWithoutCodeBlocks = html.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gim, '');
      
      const rawMarkdownIssues = {
        hasRawH4: htmlWithoutCodeBlocks.includes('#### '),
        hasRawH5: htmlWithoutCodeBlocks.includes('##### '),
        hasRawH6: htmlWithoutCodeBlocks.includes('###### '),
        hasRawBlockquote: htmlWithoutCodeBlocks.includes('> '),
        hasRawTable: htmlWithoutCodeBlocks.includes('|') && htmlWithoutCodeBlocks.includes('---'),
        hasRawList: (htmlWithoutCodeBlocks.includes('- ') || htmlWithoutCodeBlocks.includes('1. ')) && 
                   !htmlWithoutCodeBlocks.match(/<li[^>]*>.*?- .*?<\/li>/i)  // Check if raw list markers exist outside of proper lists
      };
      
      return {
        headings: {
          h1: preview.querySelectorAll('h1').length,
          h2: preview.querySelectorAll('h2').length,
          h3: preview.querySelectorAll('h3').length,
          h4: preview.querySelectorAll('h4').length,
          h5: preview.querySelectorAll('h5').length,
          h6: preview.querySelectorAll('h6').length,
        },
        blockquotes: preview.querySelectorAll('blockquote').length,
        tables: preview.querySelectorAll('table').length,
        lists: {
          ul: preview.querySelectorAll('ul').length,
          ol: preview.querySelectorAll('ol').length
        },
        images: preview.querySelectorAll('img').length,
        codeBlocks: preview.querySelectorAll('pre code').length,
        links: preview.querySelectorAll('a').length,
        paragraphs: preview.querySelectorAll('p').length,
        rawMarkdownIssues
      };
    });
    
    console.log('\\n=== BLOG POST CONTENT ===');
    console.log('Headings:', blogAnalysis.headings);
    console.log('Blockquotes:', blogAnalysis.blockquotes);
    console.log('Tables:', blogAnalysis.tables);
    console.log('Lists:', blogAnalysis.lists);
    console.log('Images:', blogAnalysis.images);
    console.log('Code blocks:', blogAnalysis.codeBlocks);
    
    console.log('\\n=== PREVIEW CONTENT ===');
    console.log('Headings:', previewAnalysis.headings);
    console.log('Blockquotes:', previewAnalysis.blockquotes);
    console.log('Tables:', previewAnalysis.tables);
    console.log('Lists:', previewAnalysis.lists);
    console.log('Images:', previewAnalysis.images);
    console.log('Code blocks:', previewAnalysis.codeBlocks);
    
    console.log('\\n=== RAW MARKDOWN ISSUES ===');
    console.log('Raw H4 found:', previewAnalysis.rawMarkdownIssues.hasRawH4);
    console.log('Raw H5 found:', previewAnalysis.rawMarkdownIssues.hasRawH5);
    console.log('Raw H6 found:', previewAnalysis.rawMarkdownIssues.hasRawH6);
    console.log('Raw blockquotes found:', previewAnalysis.rawMarkdownIssues.hasRawBlockquote);
    console.log('Raw tables found:', previewAnalysis.rawMarkdownIssues.hasRawTable);
    console.log('Raw lists found:', previewAnalysis.rawMarkdownIssues.hasRawList);
    
    // Take comparison screenshots
    await blogPage.screenshot({ path: '/tmp/blog-post-full.png', fullPage: true });
    await editorPage.screenshot({ path: '/tmp/preview-full.png', fullPage: true });
    
    console.log('\\nScreenshots saved:');
    console.log('  - Blog post: /tmp/blog-post-full.png');
    console.log('  - Preview: /tmp/preview-full.png');
    
    // Keep both open for comparison
    console.log('\\nKeeping both pages open for 10 seconds...');
    await blogPage.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

compareFullRendering().catch(console.error);