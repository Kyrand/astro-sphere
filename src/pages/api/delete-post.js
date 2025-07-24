import { unlink } from 'fs/promises';
import { join } from 'path';

export const prerender = false;

export async function POST({ request }) {
  try {
    // Only allow deleting in development environment
    if (import.meta.env.PROD) {
      return new Response(JSON.stringify({ 
        error: 'Post deletion is only available in development mode' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { slug } = await request.json();
    
    // Validate slug
    if (!slug) {
      return new Response(JSON.stringify({ 
        error: 'Slug is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize slug to prevent directory traversal
    const sanitizedSlug = slug.replace(/[^a-z0-9\-]/gi, '');
    
    // Define the path to the blog post
    const blogDir = './src/content/blog';
    const filePath = join(blogDir, `${sanitizedSlug}.md`);
    
    // Try to delete the file
    try {
      await unlink(filePath);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Post "${slug}" deleted successfully`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (deleteError) {
      if (deleteError.code === 'ENOENT') {
        return new Response(JSON.stringify({ 
          error: 'Post not found' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw deleteError;
    }
    
  } catch (error) {
    console.error('Delete post error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete post: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}