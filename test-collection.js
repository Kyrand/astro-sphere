// Simple Node.js script to test what posts are being found
// This mimics the server-side logic

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function testCollection() {
  console.log('Testing blog collection...');
  
  const blogDir = './src/content/blog';
  
  try {
    const files = await readdir(blogDir);
    const mdFiles = files.filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
    
    console.log('Found markdown files:', mdFiles);
    
    // Simulate the slug generation
    const posts = [];
    for (const file of mdFiles) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const filePath = join(blogDir, file);
      
      try {
        const content = await readFile(filePath, 'utf-8');
        const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
        let frontmatter = {};
        
        if (frontmatterMatch) {
          const yamlContent = frontmatterMatch[1];
          // Simple frontmatter parsing (just for testing)
          const lines = yamlContent.split('\n');
          for (const line of lines) {
            const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
            if (match) {
              frontmatter[match[1]] = match[2];
            }
          }
        }
        
        posts.push({
          slug,
          data: frontmatter,
          body: content.replace(/^---([\s\S]*?)---\n?/, '')
        });
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    }
    
    console.log('\nGenerated posts:');
    posts.forEach(post => {
      console.log(`- Slug: "${post.slug}" | Title: "${post.data.title || 'No title'}"`);
    });
    
    // Test the lookup logic
    const testSlug = '01-astro-sphere-file-structure';
    console.log(`\nTesting lookup for slug: "${testSlug}"`);
    
    const foundPost = posts.find(post => post.slug === testSlug);
    console.log('Found post:', foundPost ? `YES - "${foundPost.data.title}"` : 'NO');
    
    if (!foundPost) {
      // Try different matching approaches
      const exactMatch = posts.find(post => post.slug.toString() === testSlug.toString());
      console.log('Exact string match:', exactMatch ? `YES - "${exactMatch.data.title}"` : 'NO');
      
      const caseInsensitive = posts.find(post => post.slug.toLowerCase() === testSlug.toLowerCase());
      console.log('Case insensitive match:', caseInsensitive ? `YES - "${caseInsensitive.data.title}"` : 'NO');
    }
    
  } catch (error) {
    console.error('Error testing collection:', error);
  }
}

testCollection();