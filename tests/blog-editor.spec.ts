import { test, expect } from '@playwright/test';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';

// Test configuration
const TEST_POST_TITLE = 'Test Blog Post Playwright';
const UPDATED_POST_TITLE = 'Updated Test Blog Post';
const TEST_POST_SUMMARY = 'This is a test blog post created by Playwright';
const TEST_POST_CONTENT = `This is a test blog post with some **markdown** content.

Here's a list:
- Item 1
- Item 2
- Item 3

And here's a code block:

\`\`\`javascript
console.log('Hello from Playwright test!');
\`\`\`

More content after the code block.`;

const UPDATED_CONTENT = `This is the updated content for the test post.

## New Section

This content has been edited by Playwright.`;

// Helper function to generate expected slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Helper to get the blog content directory
const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog');

test.describe('Blog Editor Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start the dev server and navigate to homepage
    await page.goto('http://localhost:4321');
    
    // Enable edit mode
    await page.click('#header-edit-button');
    await page.waitForTimeout(1000); // Wait for page reload
  });

  test('Complete blog post lifecycle: create, edit, and delete', async ({ page }) => {
    const expectedSlug = generateSlug(TEST_POST_TITLE);
    const expectedFilePath = join(BLOG_DIR, `${expectedSlug}.md`);

    // Step 1: Create a new blog post
    await test.step('Create new blog post', async () => {
      // Navigate to editor directly
      await page.goto('http://localhost:4321/editor');
      await page.waitForLoadState('load');

      // Fill in the title
      await page.fill('#post-title', TEST_POST_TITLE);
      await page.waitForTimeout(100); // Small delay to ensure field is filled

      // Open metadata section
      await page.click('#metadata-toggle');
      await page.waitForSelector('#metadata-content:not(.hidden)');

      // Fill in metadata
      await page.fill('#post-summary', TEST_POST_SUMMARY);
      await page.fill('#post-tags', 'test playwright automation');

      // Add content to the markdown editor
      await page.fill('#markdown-editor', TEST_POST_CONTENT);
      await page.waitForTimeout(100); // Small delay to ensure field is filled

      // Test image upload via drag and drop (simulate with a test image)
      // For this test, we'll add an image markdown manually since actual file drag-drop is complex
      const contentWithImage = TEST_POST_CONTENT + '\n\n![Test Image](/blog_assets/images/spongebob.png)';
      await page.fill('#markdown-editor', contentWithImage);
      await page.waitForTimeout(100); // Small delay to ensure field is filled

      // Save the post
      await page.click('#save-post');
      
      // Wait for success message
      await page.waitForSelector('#status-message:not(.hidden)');
      
      // Wait for the status to change from "Saving post..." to success message
      await page.waitForFunction(
        () => {
          const statusEl = document.querySelector('#status-message');
          return statusEl?.textContent?.includes('saved successfully') || false;
        },
        { timeout: 15000 }
      );
      
      const statusText = await page.textContent('#status-message');
      expect(statusText).toContain('saved successfully');

      // Verify file was created
      const fileContent = await readFile(expectedFilePath, 'utf8');
      expect(fileContent).toContain(TEST_POST_TITLE);
      expect(fileContent).toContain(TEST_POST_SUMMARY);
      expect(fileContent).toContain('test');
      expect(fileContent).toContain('playwright');
      expect(fileContent).toContain('automation');
      expect(fileContent).toContain(contentWithImage);
    });

    // Step 2: Navigate back to homepage and verify post appears
    await test.step('Verify post appears on homepage', async () => {
      await page.goto('http://localhost:4321');
      
      // Wait for the post to appear
      await page.waitForSelector(`text="${TEST_POST_TITLE}"`, { timeout: 10000 });
      
      // Verify the summary is visible
      const summaryVisible = await page.isVisible(`text="${TEST_POST_SUMMARY}"`);
      expect(summaryVisible).toBe(true);
    });

    // Step 3: Edit the blog post
    await test.step('Edit existing blog post', async () => {
      // Find and click the edit button for our test post
      const article = await page.locator('article').filter({ hasText: TEST_POST_TITLE }).first();
      await article.locator('a:has-text("Edit")').click();
      
      await page.waitForURL(`**/editor?edit=${expectedSlug}`);

      // Verify the content loaded correctly
      const titleValue = await page.inputValue('#post-title');
      expect(titleValue).toBe(TEST_POST_TITLE);

      // Update the title and content
      await page.fill('#post-title', UPDATED_POST_TITLE);
      await page.fill('#markdown-editor', UPDATED_CONTENT);

      // Save the changes
      await page.click('#save-post');
      
      // Wait for success message
      await page.waitForSelector('#status-message:not(.hidden)');
      const updateStatusText = await page.textContent('#status-message');
      expect(updateStatusText).toContain('Post updated successfully');

      // Verify file was updated
      const updatedFileContent = await readFile(expectedFilePath, 'utf8');
      expect(updatedFileContent).toContain(UPDATED_POST_TITLE);
      expect(updatedFileContent).toContain(UPDATED_CONTENT);
      expect(updatedFileContent).not.toContain(TEST_POST_CONTENT);
    });

    // Step 4: Delete the blog post from the editor
    await test.step('Delete blog post from editor', async () => {
      // We're already on the editor page, click delete
      await page.click('#delete-post');
      
      // Handle the confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Wait for deletion and redirect
      await page.waitForURL('http://localhost:4321/', { timeout: 5000 });

      // Verify the post no longer appears on homepage
      await page.waitForTimeout(2000); // Wait for page to fully load
      const postExists = await page.isVisible(`text="${UPDATED_POST_TITLE}"`);
      expect(postExists).toBe(false);

      // Verify file was deleted
      let fileExists = true;
      try {
        await readFile(expectedFilePath, 'utf8');
      } catch {
        fileExists = false;
      }
      expect(fileExists).toBe(false);
    });
  });

  test('Delete blog post from homepage', async ({ page }) => {
    // First create a test post
    const deleteTestTitle = 'Post to Delete from Homepage';
    const deleteTestSlug = generateSlug(deleteTestTitle);
    const deleteTestPath = join(BLOG_DIR, `${deleteTestSlug}.md`);

    // Create post via editor
    await page.goto('http://localhost:4321/editor');
    await page.waitForLoadState('load');
    await page.fill('#post-title', deleteTestTitle);
    await page.waitForTimeout(100);
    await page.fill('#markdown-editor', 'This post will be deleted from the homepage.');
    await page.waitForTimeout(100);
    await page.click('#save-post');
    
    // Wait for success message
    await page.waitForSelector('#status-message:not(.hidden)');
    await page.waitForFunction(
      () => {
        const statusEl = document.querySelector('#status-message');
        return statusEl?.textContent?.includes('saved successfully') || false;
      },
      { timeout: 15000 }
    );

    // Go back to homepage
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
    await page.waitForSelector(`text="${deleteTestTitle}"`, { timeout: 10000 });

    // Find and click delete button
    const article = await page.locator('article').filter({ hasText: deleteTestTitle }).first();
    
    // Set up dialog handler before clicking delete
    page.on('dialog', dialog => dialog.accept());
    
    await article.locator('button:has-text("Delete")').click();

    // Wait for page reload
    await page.waitForTimeout(2000);

    // Verify post is gone
    const postExists = await page.isVisible(`text="${deleteTestTitle}"`);
    expect(postExists).toBe(false);

    // Verify file was deleted
    let fileExists = true;
    try {
      await readFile(deleteTestPath, 'utf8');
    } catch {
      fileExists = false;
    }
    expect(fileExists).toBe(false);
  });

  test('Preview functionality in editor', async ({ page }) => {
    await page.goto('http://localhost:4321/editor');

    // Add content
    await page.fill('#post-title', 'Preview Test Post');
    await page.fill('#markdown-editor', '# Heading\n\n**Bold text** and *italic text*');

    // Switch to preview tab
    await page.click('#preview-tab');
    
    // Wait for preview to render
    await page.waitForSelector('#preview-content:not(.hidden)');

    // Verify markdown is rendered
    const heading = await page.isVisible('#preview-html h1');
    expect(heading).toBe(true);
    
    const boldText = await page.isVisible('#preview-html strong');
    expect(boldText).toBe(true);
  });

  test('Settings persistence for compact mode', async ({ page }) => {
    // Go to settings
    await page.goto('http://localhost:4321/settings');

    // Change to compact mode
    await page.selectOption('#view-mode', 'compact');
    
    // Save settings
    await page.click('#save-settings');
    await page.waitForTimeout(1500); // Wait for save and potential reload

    // Go to homepage
    await page.goto('http://localhost:4321');

    // Verify compact mode is applied
    // In compact mode, only first paragraph should be visible
    const articles = await page.locator('article').all();
    if (articles.length > 0) {
      const firstArticle = articles[0];
      const paragraphs = await firstArticle.locator('.prose p').all();
      // In compact mode, we expect only one paragraph
      expect(paragraphs.length).toBeLessThanOrEqual(1);
    }
  });
});

// Cleanup helper - can be run after tests to ensure no test files remain
test.afterAll(async () => {
  // Clean up any remaining test files
  const testSlugs = [
    generateSlug(TEST_POST_TITLE),
    generateSlug(UPDATED_POST_TITLE),
    generateSlug('Post to Delete from Homepage'),
    generateSlug('Preview Test Post')
  ];

  for (const slug of testSlugs) {
    try {
      await unlink(join(BLOG_DIR, `${slug}.md`));
    } catch {
      // File doesn't exist, that's fine
    }
  }
});