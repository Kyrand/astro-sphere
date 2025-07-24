# Testing Guide

## Quick Start

1. **Install Playwright** (if not already installed):
   ```bash
   npx playwright install
   ```

2. **Run the tests**:
   ```bash
   npm test
   ```

## What the Tests Do

The integration tests automatically:

1. **Create a Blog Post**
   - Opens the editor
   - Fills in title: "Test Blog Post Playwright"
   - Adds summary and tags
   - Writes markdown content with code blocks
   - Saves the post
   - Verifies the file is created in `src/content/blog/`

2. **Edit the Blog Post**
   - Finds the post on the homepage
   - Clicks the edit button
   - Changes the title to "Updated Test Blog Post"
   - Updates the content
   - Saves the changes
   - Verifies the file is updated

3. **Delete the Blog Post**
   - Tests deletion from both the editor page and homepage
   - Confirms the file is removed from disk

## Test Commands

- `npm test` - Run all tests
- `npm run test:ui` - Run with interactive UI (recommended for first run)
- `npm run test:headed` - See the browser while tests run
- `npm run test:debug` - Debug mode with DevTools

## Notes

- Tests use real file system operations
- All test posts are automatically cleaned up
- The dev server starts automatically
- Tests run on port 4321 (default Astro port)