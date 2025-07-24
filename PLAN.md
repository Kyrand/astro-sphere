## Add a markdown editor
- add a markdown editor to the app.
- do not use React or another framework
- this should be at an /editor endpoint
- add an 'edit' mode
  - if in edit mode add an edit button to the articles taking the user to the editor
- the editor should allow title and other meta-data to be changed (hide this in an expandable section)
- the editor should allow images to be added by drag and drop
- new blog entries should be saved to the content/blog section
- give the editor a 'preview' option


## Add a settings end point
- add a settings button to the navbar after the 'edit' icon.
- this should access a /settings page
  - this page should allow the user to change some site settings
  - e.g. view-mode = dark
- the first setting to add is for the home page. This should be a section for the front page:
  -  'compact' or 'normal' (default) If normal then the articles in the list on the main page should include the first <frontPageArticleTextLimit> (default 1000) words. Otherwise include the first paragraph and a link at the bottom like this one which uses the length of the article for word count.

  - <span style="font-size: 0.9em">[... <a href="/2025/Jul/17/vibe-scraping/">2,189 words</a>]</span>

  You should include as an option the frontPageArticleTextLimit (label front page article text limit ) (500-5000, default 1000).

  The text limit should include any image, video or other media tags that fall within the text count threshold.

  In the 'normal' setting for the front page the article edit button and a link to the article should appear on the bottom of the article next to the tag list.


## Code block errors
The code blocks are still broken.

The code block at the top looks like this:

<code><span class="line"><span style="color:#6A737D">//astro.config.mjs</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#B392F0"> defineConfig</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  site: </span><span style="color:#9ECBFF">"https://astro-sphere.vercel.app"</span><span style="color:#E1E4E8">, </span><span style="color:#6A737D">// your domain here</span></span>
<span class="line"><span style="color:#E1E4E8">  integrations: [</span><span style="color:#B392F0">mdx</span><span style="color:#E1E4E8">(), </span><span style="color:#B392F0">sitemap</span><span style="color:#E1E4E8">(), </span><span style="color:#B392F0">solidJs</span><span style="color:#E1E4E8">(), </span><span style="color:#B392F0">tailwind</span><span style="color:#E1E4E8">({ applyBaseStyles: </span><span style="color:#79B8FF">false</span><span style="color:#E1E4E8"> })],</span></span>
<span class="line"><span style="color:#E1E4E8">})</span></span>
<span class="line"></span></code>

The code blocks on the front are not being processed by the highlighter. Fix this. Use Playwright to make sure they have the correct <span> tags and style properties.
