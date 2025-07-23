import { writeFile } from 'fs/promises';
import { join } from 'path';

export const prerender = false;

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file || !file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Invalid image file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename using timestamp and random string
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Define the path within the public/blog_assets folder for static serving
    const assetsDir = './public/blog_assets';
    const filePath = join(assetsDir, uniqueFilename);
    
    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);
    
    // Return the relative path for markdown (served from public/)
    const relativePath = `/blog_assets/${uniqueFilename}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      path: relativePath,
      originalName: file.name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to upload image: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}