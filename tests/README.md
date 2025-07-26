# Blog Editor Integration Tests

This directory contains Playwright integration tests for the blog editor functionality.

## Prerequisites

1. Ensure all dependencies are installed:
```bash
npm install
```

2. Install Playwright browsers (if not already installed):
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI mode (recommended for debugging)
```bash
npm run test:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

### Run a specific test file
```bash
npx playwright test blog-editor.spec.ts
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Coverage

The `blog-editor.spec.ts` file tests the complete blog post lifecycle:

1. **Create Blog Post**
   - Navigate to editor via floating add button
   - Fill in title, summary, tags, and content
   - Add markdown content including code blocks
   - Save the post
   - Verify file creation in `src/content/blog/`

2. **Edit Blog Post**
   - Find post on homepage
   - Click edit button
   - Verify existing content loads
   - Update title and content
   - Save changes
   - Verify file updates

3. **Delete Blog Post**
   - Delete from editor page
   - Delete from homepage
   - Verify file removal

4. **Additional Features**
   - Preview functionality
   - Settings persistence (compact mode)
   - Edit mode toggle

## Important Notes

- Tests run against `http://localhost:4321`
- The dev server is automatically started before tests
- Test files are automatically cleaned up after tests complete
- Tests create real files in `src/content/blog/` during execution

## Troubleshooting

### File Permission Errors
Ensure you have write permissions to the `src/content/blog/` directory.

### Test Timeouts
If tests are timing out, you may need to increase the timeout in the test file:
```typescript
test.setTimeout(60000); // 60 seconds
```

## Viewing Test Results

After running tests, Playwright generates an HTML report:
```bash
npx playwright show-report
```

This will open a detailed report showing:
- Test results
- Screenshots on failure
- Test execution traces
- Performance metrics
