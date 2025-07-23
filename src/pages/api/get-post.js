import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET({ url }) {
  console.log('API called with URL:', url.toString());
  console.log('URL searchParams:', Array.from(url.searchParams.entries()));
  const slug = url.searchParams.get('slug');
  console.log('Extracted slug:', slug);
  
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Try to read the markdown file directly
    const filePath = join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);
    const content = await readFile(filePath, 'utf-8');
    
    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      throw new Error('Invalid frontmatter format');
    }
    
    const [, frontmatterText, body] = frontmatterMatch;
    
    // Simple YAML parsing for frontmatter
    const data = {};
    const lines = frontmatterText.split('\n');
    let currentKey = null;
    let arrayValues = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('- ')) {
        // Array item
        if (currentKey) {
          arrayValues.push(trimmed.substring(2));
        }
      } else {
        // Key-value pair
        if (currentKey && arrayValues.length > 0) {
          data[currentKey] = arrayValues;
          arrayValues = [];
        }
        
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > -1) {
          currentKey = trimmed.substring(0, colonIndex).trim();
          let value = trimmed.substring(colonIndex + 1).trim();
          
          // Remove quotes and parse booleans
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          if (value === 'true') value = true;
          if (value === 'false') value = false;
          
          data[currentKey] = value;
        }
      }
    }
    
    // Handle final array if exists
    if (currentKey && arrayValues.length > 0) {
      data[currentKey] = arrayValues;
    }
    
    return new Response(JSON.stringify({
      slug,
      data,
      body: body.trim()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error loading post:', error);
    return new Response(JSON.stringify({ 
      error: 'Post not found',
      details: error.message 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}