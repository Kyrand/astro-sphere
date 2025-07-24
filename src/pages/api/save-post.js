import { writeFile } from 'fs/promises';
import { join } from 'path';

export const prerender = false;

export async function POST({ request }) {
  try {
    // Only allow saving in development environment
    if (import.meta.env.PROD) {
      return new Response(JSON.stringify({ 
        error: 'Post saving is only available in development mode' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title, summary, tags, date, content, slug, draft = false } = await request.json();
    
    // Validate required fields
    if (!title || !content) {
      return new Response(JSON.stringify({ 
        error: 'Title and content are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate slug if not provided
    const postSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Generate filename with incremental number to avoid conflicts
    let filename = `${postSlug}.md`;
    let counter = 1;
    
    // Check if file exists and increment counter if needed
    const blogDir = './src/content/blog';
    const fs = await import('fs/promises');
    
    try {
      while (true) {
        const testPath = join(blogDir, filename);
        await fs.access(testPath);
        // File exists, increment counter
        filename = `${postSlug}-${counter}.md`;
        counter++;
      }
    } catch {
      // File doesn't exist, we can use this filename
    }

    // Format the frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `summary: "${summary || ''}"`, // Always include summary, even if empty
      `date: "${date || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      })}"`,
      `draft: ${draft}`,
      'tags:'
    ];

    // Add tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      tags.forEach(tag => {
        frontmatter.push(`- ${tag}`);
      });
    } else {
      frontmatter.push('- Blog');
    }

    frontmatter.push('---');
    frontmatter.push('');

    // Combine frontmatter with content
    const fileContent = frontmatter.join('\n') + content;

    // Write the file
    const filePath = join(blogDir, filename);
    await writeFile(filePath, fileContent, 'utf8');

    return new Response(JSON.stringify({ 
      success: true, 
      filename,
      path: filePath,
      slug: postSlug
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save post error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save post: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}