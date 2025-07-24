import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';
import { getHighlighter } from 'shiki';

export const prerender = false;

// Plugin to fix relative image paths
function fixRelativeImages() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img' && node.properties && node.properties.src) {
        const src = node.properties.src;
        // Convert relative paths to blog_assets/images directory
        if (src.startsWith('./')) {
          node.properties.src = `/blog_assets/images/${src.slice(2)}`;
        }
      }
    });
  };
}

// Plugin to add Shiki syntax highlighting like Astro does
function addShikiHighlighting(highlighter) {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'pre' && node.children && node.children[0] && node.children[0].tagName === 'code') {
        const codeNode = node.children[0];
        
        // Get the language and code content
        const className = codeNode.properties.className || [];
        const langClass = className.find(cls => cls.startsWith('language-'));
        
        if (langClass && codeNode.children && codeNode.children[0] && codeNode.children[0].type === 'text') {
          const language = langClass.replace('language-', '');
          const code = codeNode.children[0].value;
          
          try {
            // Use Shiki to highlight the code (same as Astro)
            const highlighted = highlighter.codeToHtml(code, {
              lang: language,
              theme: 'github-dark'
            });
            
            // Extract the content between <pre> tags and replace current node with raw HTML
            const preMatch = highlighted.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
            if (preMatch) {
              // Extract attributes from the pre tag
              const preTagMatch = highlighted.match(/<pre([^>]*)>/);
              if (preTagMatch) {
                const attributesString = preTagMatch[1];
                
                // Parse basic attributes (class, style, tabindex)
                const classMatch = attributesString.match(/class="([^"]*)"/);
                const styleMatch = attributesString.match(/style="([^"]*)"/);
                const tabindexMatch = attributesString.match(/tabindex="([^"]*)"/);
                
                node.properties = {
                  className: classMatch ? classMatch[1].split(' ') : ['astro-code', 'github-dark'],
                  style: styleMatch ? styleMatch[1] : 'background-color:#24292e;color:#e1e4e8; overflow-x: auto;',
                  tabindex: tabindexMatch ? tabindexMatch[1] : '0'
                };
                
                // Replace content with highlighted HTML
                node.children = [{
                  type: 'raw',
                  value: preMatch[1]
                }];
              }
            }
          } catch (error) {
            console.warn(`Failed to highlight code for language ${language}:`, error);
            // Fall back to basic styling
            node.properties = node.properties || {};
            node.properties.className = ['astro-code', 'github-dark'];
            node.properties.style = 'background-color:#24292e;color:#e1e4e8; overflow-x: auto;';
            node.properties.tabindex = '0';
            node.properties['data-language'] = language;
          }
        }
      }
    });
  };
}


// Cache the highlighter to avoid recreating it on every request
let highlighterCache = null;

export async function POST({ request }) {
  try {
    const { markdown } = await request.json();
    
    if (!markdown) {
      return new Response(JSON.stringify({ error: 'No markdown content provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Shiki highlighter if not cached
    if (!highlighterCache) {
      highlighterCache = await getHighlighter({
        themes: ['github-dark'],
        langs: ['javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'bash', 'text']
      });
    }

    // Use the same markdown processing pipeline that Astro uses  
    const processor = unified()
      .use(remarkParse)           // Parse markdown
      .use(remarkGfm)            // GitHub Flavored Markdown (tables, strikethrough, etc.)
      .use(remarkRehype, { allowDangerousHtml: true })  // Convert to HTML
      .use(fixRelativeImages)    // Fix relative image paths
      .use(addShikiHighlighting, highlighterCache)  // Add Shiki syntax highlighting
      .use(rehypeRaw)            // Handle raw HTML in markdown
      .use(rehypeStringify);     // Serialize to HTML string

    const result = await processor.process(markdown);
    const htmlContent = String(result);

    // Wrap with the same prose classes used in blog posts
    const wrappedHtml = `<article class="prose dark:prose-invert max-w-full pb-12">${htmlContent}</article>`;

    return new Response(JSON.stringify({ 
      success: true, 
      html: wrappedHtml
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to render markdown: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}