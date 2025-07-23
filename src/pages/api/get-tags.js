import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const blogDir = './src/content/blog';
    const files = await readdir(blogDir);
    const mdFiles = files.filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
    
    const allTags = new Set();
    
    for (const file of mdFiles) {
      const filePath = join(blogDir, file);
      try {
        const content = await readFile(filePath, 'utf-8');
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const tagsMatch = frontmatter.match(/tags:\s*\n((?:\s*-\s*.+\n?)*)/);
          
          if (tagsMatch) {
            const tagLines = tagsMatch[1].trim().split('\n');
            tagLines.forEach(line => {
              const tag = line.replace(/^\s*-\s*/, '').trim();
              if (tag) {
                allTags.add(tag);
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    }
    
    return new Response(JSON.stringify({
      tags: Array.from(allTags).sort()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error getting tags:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get tags',
      tags: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}