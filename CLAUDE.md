# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `make dev` to start the dev server

**Important:**

- NEVER start the server in any other way than with `make dev`, NEVER kill or stop it.
- the server and the client are logging into .log/challmar.log which you can look at with `make tail-log`
- If you are told about a bug, always consult the log first (`make tail-log`)
- **After creating or testing new modules/endpoints**: Always run `make tail-log` to check for import errors, missing dependencies, or runtime issues. For example, after creating test scripts like 'test_page_processing.py', check the logs for any errors that may not be immediately visible in the response.


**IMPORTANT**
Use playwright mcp to open the site (localhost:4321) during debugging to make sure that, for example:
- text appears where it should be pre-filled (e.g. /editor when editing an existing post)
- clicking buttons works as expected
- links work as expected
- use the console logging to debug errors


When using Playwright only navigate to the existing dev server. DO NOT START A NEW ONE!!.
The existing server should be on port 4321.

### Essential Commands
```bash
# Development
npm run dev          # Start dev server on localhost:4321
npm run dev:network  # Start dev server accessible on network

# Build & Preview
npm run build        # Type-check and build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
```

### Package Management
This project uses pnpm (preferred), but also supports npm, yarn, and bun.

## Architecture Overview

### Framework Stack
- **Astro 4.4.13** - Static site generator with partial hydration
- **SolidJS** - For interactive components (search, filters)
- **TypeScript** - Strict mode enabled with path aliases (@* → src/*)
- **Tailwind CSS** - Utility-first styling with dark mode support
- **MDX** - Enhanced markdown for content authoring

### Project Structure
```
src/
├── components/       # Mix of .astro (static) and .tsx (interactive) components
├── content/         # Content collections (blog, projects, work, legal)
│   └── config.ts    # Zod schemas for content validation
├── layouts/         # Page layouts with hierarchy: PageLayout > TopLayout/BottomLayout
├── pages/           # File-based routing with dynamic [...slug] patterns
├── lib/             # Utilities (utils.ts contains cn() for class merging)
└── styles/          # Global CSS (global.css)
```

### Content Collections
Four collections defined with Zod schemas:
- **blog**: Posts with title, summary, date, tags, draft status
- **projects**: Similar to blog with additional demoUrl/repoUrl
- **work**: Company/role/date information
- **legal**: Privacy policy, terms, etc.

### Routing Architecture
- **Static Routes**: index (blog listing), search, project listing, tags listing, editor
- **Dynamic Routes**:
  - `[...slug].astro` - Handles blog/project/legal individual pages
  - `tags/[tag].astro` - Individual tag pages showing filtered posts
  - Uses `getStaticPaths()` to pre-build all content pages
- **Editor Route**: `/editor` - Markdown blog post editor with live preview

### Component Patterns
- **`.astro` components**: Server-rendered, zero JavaScript
- **`.tsx` components**: Client-side interactive (marked with `client:load`)
- **Search Components**: Use SolidJS signals for reactive state
- **Props**: Strongly typed with TypeScript interfaces

### Search and Tags System
- **Homepage Search**: Full-text search using Fuse.js with search box and clickable tags
- **Global Search** (search page): Simplified cross-collection search
- **Tag System**:
  - `/tags` - All tags ordered by usage count
  - `/tags/[tag]` - Posts filtered by specific tag
  - Tags displayed with usage counts and ordered by popularity
  - Tags are clickable and lead to filtered views

Search indexes: slug, title, summary, and tags fields.

### Styling Approach
- Tailwind CSS with custom animations (twinkling stars, meteors)
- Dark mode via class strategy
- Typography plugin for markdown content
- Utility helper: `cn()` for conditional class merging
- Clean list styling with light gray separators instead of borders

### Build Process
1. TypeScript checking via `@astrojs/check`
2. Static site generation
3. Automatic sitemap.xml and rss.xml generation
4. Image optimization with Sharp

### Performance Considerations
- Achieves 100/100 Lighthouse score
- Minimal client-side JavaScript
- Font preloading for Atkinson font family
- Lazy hydration for interactive components
- All content pre-rendered at build time

### Key Files to Understand
- `astro.config.mjs` - Framework configuration and integrations
- `src/content/config.ts` - Content schema definitions
- `src/lib/utils.ts` - Common utilities
- `src/components/Search.tsx` - Search implementation example
- `src/pages/[...slug].astro` - Dynamic routing pattern

### Blog Editor System
- **Editor Access**: Navigate to `/editor` to create new posts
- **Edit Mode**: Set `SITE.EDIT_MODE = true` in consts.ts to show edit buttons on articles
- **Features**:
  - Live markdown preview with tab switching
  - Drag & drop image upload
  - Collapsible metadata editor (title, summary, tags, draft status)
  - Edit existing posts via `/editor?edit=slug-name`
  - Download functionality for generated markdown files

### Common Development Tasks
When adding new content:
1. Use the built-in editor at `/editor` or manually create files
2. Place markdown files directly in content folders (no subfolders)
   - Blog posts: `src/content/blog/post-title.md`
   - Projects: `src/content/projects/project-name.md`
3. Follow existing frontmatter schema
4. Use draft: true to hide from production

When creating components:
1. Use .astro for static content
2. Use .tsx with SolidJS for interactivity
3. Add `client:load` directive for hydration

When modifying styles:
1. Prefer Tailwind utilities
2. Use `cn()` helper for conditional classes
3. Maintain dark mode compatibility
